import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ShelterStep } from "./shelter-step";
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
      <ShelterStep form={form} shelters={shelters} />
    </NextIntlClientProvider>
  );
}

describe("ShelterStep", () => {
  it("marks the shelter picker optional for a general donation by default", () => {
    render(<TestHarness />);
    expect(screen.getByText("(Optional)")).toBeInTheDocument();
  });

  it("drops the optional marker once 'Donate to a specific shelter' is selected", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("radio", { name: /donate to a specific shelter/i }));

    expect(screen.queryByText("(Optional)")).not.toBeInTheDocument();
  });

  it("sets the amount when a preset is clicked", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("radio", { name: "20 euros" }));

    expect(screen.getByPlaceholderText("0")).toHaveValue("20");
  });
});
