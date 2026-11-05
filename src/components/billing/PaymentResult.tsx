"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { formatExpiry, type Subscription } from "@/lib/billing";

export default function PaymentResult({ reference }: { reference: string }) {
  const [status, setStatus] = useState<"checking" | "success" | "pending" | "error">("checking");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [message, setMessage] = useState("");
  const validReference = /^[a-zA-Z0-9_-]{1,100}$/.test(reference);
  const verify = useCallback(async () => {
    if (!validReference) return;
    setStatus("checking");
    setMessage("");
    try {
      const response = await fetch(`/api/payments/verify/${encodeURIComponent(reference)}`, { cache: "no-store" });
      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(`/billing/callback?reference=${encodeURIComponent(reference)}`)}`);
        return;
      }
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to confirm this payment yet.");
      if (data.status === "success") {
        setSubscription(data.subscription);
        setStatus("success");
      } else {
        setStatus("pending");
        setMessage("Your payment has not been confirmed yet. If you have paid, wait a moment and check again. You do not need to pay again.");
      }
    } catch (cause) {
      setStatus("error");
      setMessage(cause instanceof Error ? cause.message : "Unable to confirm your payment. Please check again.");
    }
  }, [reference, validReference]);
  useEffect(() => { void verify(); }, [verify]);
  return <main className="grid min-h-screen place-items-center bg-[#f6f4ee] px-4 py-10 text-[#0f3d2c]">
    <section className="w-full max-w-xl rounded-3xl border border-[#dbe4dc] bg-white p-7 text-center sm:p-10" aria-live="polite">
      {!validReference ? <><h1 className="text-2xl font-black">Payment reference missing</h1><p className="mt-4 text-sm leading-7 text-[#42554a]">Open the confirmation link from your checkout to check payment status, or return to your plans.</p></> : <>
        {status === "checking" && <Loader2 className="mx-auto animate-spin" size={36} />}
        {status === "success" && <CheckCircle2 className="mx-auto text-[#17805a]" size={42} />}
        <h1 className="mt-4 text-2xl font-black">{status === "checking" ? "Confirming your payment…" : status === "success" ? "Payment confirmed" : status === "pending" ? "Payment awaiting confirmation" : "We could not confirm your payment"}</h1>
        {status === "success" ? <><p className="mt-4 leading-7 text-[#42554a]">{subscription?.accountType === "premium" ? "Your premium plan is active. Your dashboard reflects your current access." : "This payment has been received. Your account currently has regular access; view your plans to renew."}</p>{subscription?.accountType === "premium" && subscription.expiresAt && <p className="mt-3 text-sm">Access until {formatExpiry(subscription.expiresAt)}</p>}<p className="mt-3 text-sm text-[#42554a]">{subscription?.hasProAccess ? "Your plan includes JAMB past questions, available when practice reopens after maintenance." : "JAMB past questions require an active Pro or Pro Max plan."}</p></> : <p className="mt-4 text-sm leading-7 text-[#42554a]">{message || "Please keep this page open while we check your payment."}</p>}
        <p className="mt-5 break-all text-xs text-[#607167]">Reference: {reference}</p>
        {(status === "pending" || status === "error") && <button onClick={() => void verify()} className="mt-6 rounded-full bg-[#0f3d2c] px-6 py-3 text-sm font-bold text-white">Check payment again</button>}
      </>}
      <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm font-bold"><Link href="/dashboard" className="underline">Go to dashboard</Link><Link href="/billing" className="underline">View plans</Link></div>
    </section>
  </main>;
}
