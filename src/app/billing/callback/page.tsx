import PaymentResult from "@/components/billing/PaymentResult";

export const metadata = { title: "Payment confirmation | BJOT", robots: { index: false, follow: false } };

export default async function PaymentCallbackPage({ searchParams }: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = typeof params.reference === "string" ? params.reference : typeof params.trxref === "string" ? params.trxref : "";
  return <PaymentResult reference={reference} />;
}
