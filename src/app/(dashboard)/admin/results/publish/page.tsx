import ResultsPublishManager from "@/components/modules/admin/results/results-publish-manager";

export const metadata = {
  title: "Publish Results",
  description: "Publish exam results or override a single result.",
};

export default function AdminResultsPublishPage() {
  return <ResultsPublishManager />;
}
