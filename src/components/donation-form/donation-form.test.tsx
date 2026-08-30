import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it } from "vitest";

import { DonationForm } from "./donation-form";
import { useDonationFormStore } from "@/stores/donation-form-store";
import messages from "../../../messages/en.json";

const shelters = [{ id: 1, name: "Útulok Bratislava" }];

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="en" messages={messages}>
        <DonationForm shelters={shelters} />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("DonationForm step navigation", () => {
  // The step lives in a module-level Zustand store, so it must be reset
  // between tests or a later test would silently start mid-flow.
  beforeEach(() => {
    act(() => {
      useDonationFormStore.getState().reset();
    });
  });

  it("blocks advancing past the shelter step while the amount is invalid, then advances once fixed", async () => {
    const user = userEvent.setup();
    renderForm();

    const amountInput = screen.getByPlaceholderText("0");
    await user.clear(amountInput);
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Still on the shelter step: its inline field error is shown and its
    // controls remain.
    expect(await screen.findByText("Enter a donation amount")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "20 euros" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add another donor" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "20 euros" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Now on the details step.
    expect(await screen.findByRole("button", { name: "Add another donor" })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "20 euros" })).not.toBeInTheDocument();
  });
});
