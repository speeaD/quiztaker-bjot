import BillingClient from "@/components/billing/BillingClient";

export const metadata = { title: "Upgrade your plan | BJOT", robots: { index: false, follow: false } };

export default async function BillingPage({ searchParams }: {
  searchParams: Promise<{ plan?: string; cancelled?: string }>;
}) {
  const { plan, cancelled } = await searchParams;
  return <BillingClient initialPlan={typeof plan === "string" ? plan : ""} cancelled={cancelled === "1"} />;
}
