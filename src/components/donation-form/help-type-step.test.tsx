import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { HelpTypeStep } from "./help-type-step";
import {
  donationFormDefaultValues,
  donationFormSchema,
  type DonationFormInput,
  type DonationFormValues,
} from "@/lib/validations/donation";
import messages from "../../../messages/en.json";

const shelters = [
  { id: 1, name: "Útulok Bratislava" },
  { id: 2, name: "Útulok Košice" },
];

function TestHarness() {
  const form = useForm<DonationFormInput, unknown, DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: donationFormDefaultValues,
  });

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <HelpTypeStep form={form} shelters={shelters} />
    </NextIntlClientProvider>
  );
}

describe("HelpTypeStep", () => {
  it("does not show the shelter picker for a general donation by default", () => {
    render(<TestHarness />);
    expect(screen.queryByLabelText("Shelter")).not.toBeInTheDocument();
  });

  it("shows the shelter picker once 'Specific shelter' is selected", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("radio", { name: /specific shelter/i }));

    expect(await screen.findByLabelText("Shelter")).toBeInTheDocument();
  });

  it("hides the shelter picker again when switching back to a general donation", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("radio", { name: /specific shelter/i }));
    await screen.findByLabelText("Shelter");
    await user.click(screen.getByRole("radio", { name: /general donation/i }));

    expect(screen.queryByLabelText("Shelter")).not.toBeInTheDocument();
  });
});
