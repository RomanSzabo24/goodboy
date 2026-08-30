import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PersonalDetailsStep } from "./personal-details-step";
import {
  donationFormDefaultValues,
  donationFormSchema,
  type DonationFormInput,
  type DonationFormValues,
} from "@/lib/validations/donation";
import messages from "../../../messages/en.json";

function TestHarness() {
  // Mirrors DonationForm's mode: "onBlur", so error rendering here reflects
  // what actually happens when this step is embedded in the real form.
  const form = useForm<DonationFormInput, unknown, DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    mode: "onBlur",
    defaultValues: donationFormDefaultValues,
  });

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <PersonalDetailsStep form={form} />
    </NextIntlClientProvider>
  );
}

async function fillFirstDonor(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Surname"), "Novak");
  await user.type(screen.getByLabelText("E-mail address"), "novak@example.com");
  await user.type(screen.getByLabelText("Phone number"), "900 000 000");
}

describe("PersonalDetailsStep", () => {
  it("collapses a correctly filled donor into a summary with an Edit button when another is added", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await fillFirstDonor(user);
    await user.click(screen.getByRole("button", { name: "Add another donor" }));

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByText("novak@example.com")).toBeInTheDocument();
    // Only the newly added second donor row is still an editable form.
    expect(screen.getAllByLabelText("Surname")).toHaveLength(1);
    expect(screen.getByLabelText("E-mail address")).toHaveValue("");
  });

  it("disables the add donor button until the current row is filled in correctly", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    expect(screen.getByRole("button", { name: "Add another donor" })).toBeDisabled();

    // Filling only the optional field must not be enough to enable it.
    await user.type(screen.getByLabelText("Name"), "Peter");
    expect(screen.getByRole("button", { name: "Add another donor" })).toBeDisabled();

    await fillFirstDonor(user);
    expect(screen.getByRole("button", { name: "Add another donor" })).toBeEnabled();
  });

  it("expands a collapsed donor back into an editable form via the Edit button", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await fillFirstDonor(user);
    await user.click(screen.getByRole("button", { name: "Add another donor" }));
    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getAllByLabelText("Surname")).toHaveLength(2);
  });

  it("renders an inline error when the e-mail field is blurred with an invalid value", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.type(screen.getByLabelText("E-mail address"), "not-an-email");
    await user.tab();

    expect(await screen.findByRole("alert")).toHaveTextContent("Enter a valid e-mail address");
  });

  it("renders an inline error when the phone field is blurred with an invalid value", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.type(screen.getByLabelText("Phone number"), "123");
    await user.tab();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter a valid SK (+421) or CZ (+420) phone number",
    );
  });

  it("clears the surname error once a valid value is entered and blurred", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);
    // Fill in the other required fields first so tabbing off surname later
    // doesn't blur into (and flag) an unrelated empty field.
    await user.type(screen.getByLabelText("E-mail address"), "novak@example.com");
    await user.type(screen.getByLabelText("Phone number"), "900 000 000");

    await user.click(screen.getByLabelText("Surname"));
    await user.tab();
    expect(await screen.findByText("Surname must be at least 2 characters")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Surname"), "Novak");
    await user.tab();
    expect(screen.queryByText("Surname must be at least 2 characters")).not.toBeInTheDocument();
  });
});
