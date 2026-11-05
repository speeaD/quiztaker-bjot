"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { formatNaira } from "@/lib/pricing";
import { formatExpiry, type PaymentPlan, type Subscription } from "@/lib/billing";

export default function BillingClient({ initialPlan, cancelled }: { initialPlan: string; cancelled: boolean }) {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedId, setSelectedId] = useState(initialPlan);
  const [track, setTrack] = useState(initialPlan.startsWith("art-commercial-") ? "Art & Commercial" : "Science");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/payments/plans", { cache: "no-store" });
      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      const data = await response.json();
      if (!response.ok || !data.success || !Array.isArray(data.plans)) throw new Error(data.message || "Unable to load plans");
      setPlans(data.plans);
      setSubscription(data.subscription);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load plans");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const selected = plans.find((plan) => plan.id === selectedId);
  const unavailableReason = (plan: PaymentPlan) => {
    if (!plan.available) return "Enrolment currently unavailable";
    if (subscription?.accountType !== "premium") return "";
    if (subscription.planLevel === "pro-max") return "Your Pro Max plan already covers the tutorial period";
    if (subscription.planLevel === "pro" && plan.level === "lite") return "Available after your current Pro plan expires";
    return "";
  };
  const checkout = async () => {
    if (!selected || unavailableReason(selected) || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId: selected.id }),
      });
      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(`/billing?plan=${selected.id}`)}`);
        return;
      }
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not start checkout");
      const checkoutUrl = new URL(data.authorizationUrl);
      if (checkoutUrl.protocol !== "https:") throw new Error("The payment service returned an invalid checkout link. Please retry.");
      window.location.assign(checkoutUrl.href);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start checkout");
      setBusy(false);
    }
  };
  return <main className="min-h-screen bg-[#f6f4ee] px-4 py-8 text-[#0f3d2c] sm:py-12">
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap justify-between gap-4 text-sm font-bold"><Link href="/dashboard" className="underline">← Dashboard</Link><Link href="/pricing" className="underline">Compare plan features</Link></div>
      <h1 className="mt-8 text-3xl font-black sm:text-4xl">Choose your premium plan</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#42554a]">Lite includes classes and study support. Pro and Pro Max also include JAMB past questions. Pay securely with Bachs to activate your plan.</p>
      <p className="mt-3 rounded-xl border border-[#e9d39b] bg-[#fff8e8] p-4 text-sm text-[#744700]">JAMB Past Questions is currently under maintenance. Pro access will be available when practice reopens.</p>
      {cancelled && <p role="status" className="mt-4 rounded-xl bg-white p-4 text-sm text-[#42554a]">Checkout was closed. Your plan will only change after payment is confirmed. You can resume checkout below.</p>}
      {subscription && <section className="mt-6 rounded-2xl border border-[#dbe4dc] bg-white p-5" aria-label="Current subscription">
        <p className="text-xs font-bold uppercase tracking-widest text-[#607167]">Your current access</p>
        <p className="mt-2 font-bold">{subscription.accountType === "premium" ? subscription.planId ? plans.find((plan) => plan.id === subscription.planId)?.name || "Premium" : "Premium" : "Regular (free)"}</p>
        {subscription.accountType === "premium" && subscription.expiresAt && <p className="mt-1 text-sm text-[#42554a]">Active until {formatExpiry(subscription.expiresAt)}</p>}
        <p className="mt-1 text-sm text-[#42554a]">{subscription.hasProAccess ? "Includes Pro access to JAMB past questions." : "JAMB past questions require an active Pro or Pro Max plan."}</p>
      </section>}
      {error && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}{!plans.length && <button onClick={() => void load()} className="ml-3 font-bold underline">Retry</button>}</div>}
      {loading ? <p role="status" className="mt-8 flex items-center gap-2"><Loader2 className="animate-spin" size={18} />Loading plans…</p> : <>
        {!!plans.length && <>
          <fieldset className="mt-8" disabled={busy}><legend className="text-sm font-bold">Department</legend><div className="mt-3 flex flex-wrap gap-3">{["Science", "Art & Commercial"].map((item) => <button key={item} type="button" aria-pressed={track === item} onClick={() => { setTrack(item); setSelectedId(""); }} className={`rounded-full border px-5 py-2 text-sm font-bold ${track === item ? "border-[#0f3d2c] bg-[#0f3d2c] text-white" : "border-[#dbe4dc] bg-white"}`}>{item}</button>)}</div></fieldset>
          <fieldset className="mt-6" disabled={busy}><legend className="sr-only">Select a plan</legend><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{plans.filter((plan) => plan.track === track).map((plan) => <label key={plan.id} className={`relative flex cursor-pointer gap-3 rounded-2xl border bg-white p-5 ${selectedId === plan.id ? "border-[#0f3d2c] ring-2 ring-[#0f3d2c]" : "border-[#dbe4dc]"} ${unavailableReason(plan) ? "opacity-60" : ""}`}>
            <input type="radio" name="plan" value={plan.id} checked={selectedId === plan.id} disabled={!!unavailableReason(plan)} onChange={() => setSelectedId(plan.id)} className="mt-1 accent-[#0f3d2c]" />
            <span><strong className="block">{plan.name}</strong><span className="mt-2 block text-2xl font-black">{formatNaira(plan.amount / 100)}</span><span className="mt-1 block text-sm text-[#42554a]">{plan.months ? `${plan.months} month${plan.months > 1 ? "s" : ""}` : plan.expiresAt ? `Until ${formatExpiry(plan.expiresAt)}` : "Through the tutorial period"}</span><span className="mt-3 flex items-center gap-1 text-xs font-semibold"><Check size={14} />{plan.level === "lite" ? "Classes and study support" : "Includes JAMB past questions"}</span>{unavailableReason(plan) && <span className="mt-2 block text-xs font-bold">{unavailableReason(plan)}</span>}</span>
          </label>)}</div></fieldset>
          <section className="mt-8 rounded-2xl bg-[#0f3d2c] p-6 text-white">
            <h2 className="font-bold">{selected ? `${selected.track} · ${selected.name}` : "Select a plan to continue"}</h2>
            {selected && <p className="mt-2 text-2xl font-black text-[#f4be56]">{formatNaira(selected.amount / 100)}</p>}
            <p className="mt-3 text-sm leading-6 text-white/80">One payment for the selected period. Your access is activated after payment confirmation. Payments do not renew automatically.</p>
            {selected && subscription?.accountType === "premium" && subscription.planLevel && !unavailableReason(selected) && <p className="mt-2 text-sm leading-6 text-white/80">{subscription.planLevel === selected.level
              ? "Renewing this level adds the selected months to your remaining access."
              : selected.level === "pro-max" ? `Upgrading activates Pro Max immediately, through ${selected.expiresAt ? formatExpiry(selected.expiresAt) : "the end of the tutorial period"}. Your existing access period will not be shortened.`
              : "Upgrading activates Pro immediately for the full selected period from today. Your existing access period will not be shortened."}</p>}
            {selected && unavailableReason(selected) && <p className="mt-3 text-sm text-[#f4be56]">{unavailableReason(selected)}</p>}
            <button onClick={() => void checkout()} disabled={!selected || !!unavailableReason(selected) || busy} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#f4be56] px-6 py-3 font-bold text-[#0f3d2c] disabled:cursor-not-allowed disabled:opacity-50">{busy ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}{busy ? "Opening secure checkout…" : "Pay with Bachs"}</button>
          </section>
        </>}
      </>}
    </div>
  </main>;
}
