import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ConfirmStep } from "./confirm-step";
import {
  donationFormDefaultValues,
  donationFormSchema,
  type DonationFormInput,
  type DonationFormValues,
} from "@/lib/validations/donation";
import messages from "../../../messages/en.json";

// ConfirmStep has no submit button of its own — the real DonationForm
// validates it via form.handleSubmit() on the "Donate" click, so the harness
// mimics that exactly (rather than a bare form.trigger()) since RHF only
// starts auto-clearing an errored field on change after a real submit
// attempt has set formState.isSubmitted.
function TestHarness() {
  const form = useForm<DonationFormInput, unknown, DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      ...donationFormDefaultValues,
      contributors: [
        { name: "", surname: "Novak", email: "novak@example.com", phone: "+421 900 000 000" },
      ],
    },
  });

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <ConfirmStep form={form} shelters={[]} />
      <button type="button" onClick={() => void form.handleSubmit(() => {})()}>
        Validate
      </button>
    </NextIntlClientProvider>
  );
}

describe("ConfirmStep", () => {
  it("renders an inline error when consent hasn't been given", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("button", { name: "Validate" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You must consent to personal data processing",
    );
  });

  it("clears the consent error once the checkbox is checked", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("button", { name: "Validate" }));
    await screen.findByRole("alert");

    await user.click(screen.getByRole("checkbox"));

    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });
});
