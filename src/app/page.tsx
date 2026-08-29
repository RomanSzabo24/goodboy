import { DonationForm } from "@/components/donation-form/donation-form";
import { ResultsSummary } from "@/components/results/results-summary";
import { getShelters, getSheltersResults } from "@/services/shelters";

// Results are "regularly updated" per the assignment brief — don't freeze
// them into a build-time static page; revalidate every 30s to match the
// client-side polling interval in useSheltersResults.
export const revalidate = 30;

export default async function Home() {
  const [sheltersResponse, resultsResponse] = await Promise.all([
    getShelters(),
    getSheltersResults(),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-10 sm:py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">GoodBoy Foundation</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Help us support Slovak dog shelters — donate to the foundation or to a shelter of
          your choice.
        </p>
      </div>
      <ResultsSummary initialData={resultsResponse} />
      <DonationForm shelters={sheltersResponse.shelters} />
    </main>
  );
}
