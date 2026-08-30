import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResultsSummary } from "./results-summary";
import { getSheltersResults } from "@/services/shelters";
import type { ResultsResponse } from "@/services/shelters";
import messages from "../../../messages/en.json";

vi.mock("@/services/shelters", () => ({
  getSheltersResults: vi.fn(),
}));

function renderWithProviders(initialData: ResultsResponse) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="en" messages={messages}>
        <ResultsSummary initialData={initialData} />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("ResultsSummary", () => {
  beforeEach(() => {
    vi.mocked(getSheltersResults).mockReset();
  });

  it("shows the server-provided totals immediately, then swaps in the freshly fetched totals", async () => {
    vi.mocked(getSheltersResults).mockResolvedValue({ contributors: 9, contribution: 900 });

    renderWithProviders({ contributors: 3, contribution: 150 });

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(await screen.findByText("9")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });

  it("falls back to the initial totals and surfaces a refresh error when the query fails", async () => {
    vi.mocked(getSheltersResults).mockRejectedValue(new Error("network down"));

    renderWithProviders({ contributors: 3, contribution: 150 });

    expect(
      await screen.findByText(
        "Couldn't refresh the latest data, showing the last known values.",
      ),
    ).toBeInTheDocument();
    // The last known (initial) totals stay on screen instead of being cleared.
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("polls again after 30 seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(getSheltersResults).mockResolvedValue({ contributors: 9, contribution: 900 });

    renderWithProviders({ contributors: 3, contribution: 150 });
    await waitFor(() => expect(getSheltersResults).toHaveBeenCalledTimes(1));

    vi.mocked(getSheltersResults).mockResolvedValue({ contributors: 12, contribution: 1200 });
    await vi.advanceTimersByTimeAsync(30_000);
    await waitFor(() => expect(getSheltersResults).toHaveBeenCalledTimes(2));

    vi.useRealTimers();
  });
});
