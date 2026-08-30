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
  const form = useForm<DonationFormInput, unknown, DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
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
});
