import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const replaceMock = vi.fn();

// The wizard's steps are real routes now, so navigation goes through
// next-intl's router instead of a Zustand step field — mock our own thin
// wrapper module rather than Next's internals.
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => "/",
}));

import { DonationWizardProvider } from "./donation-wizard-provider";
import { ShelterPageContent } from "./shelter-page-content";
import messages from "../../../messages/en.json";

const shelters = [{ id: 1, name: "Útulok Bratislava" }];

function renderWizard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="en" messages={messages}>
        <DonationWizardProvider shelters={shelters} footer={null}>
          <ShelterPageContent />
        </DonationWizardProvider>
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("DonationWizardProvider navigation", () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
  });

  it("blocks advancing past the shelter step while the amount is invalid, then navigates once fixed", async () => {
    const user = userEvent.setup();
    renderWizard();

    const amountInput = screen.getByPlaceholderText("0");
    await user.clear(amountInput);
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Still on the shelter step: its inline field error is shown and the
    // route push to the details step never happened.
    expect(await screen.findByText("Enter a donation amount")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("radio", { name: "20 euros" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(pushMock).toHaveBeenCalledWith("/donate/details");
  });
});
