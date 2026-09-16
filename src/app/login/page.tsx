"use client";

import {
  ArrowRight,
  Clipboard,
  CircleHelp,
  Info,
  KeyRound,
  Loader2,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import PortalLogo from "@/components/PortalLogo";

export default function Login() {
  const backendUrl =
    process.env.BACKEND_URL || "https://bjot-backend-nine.vercel.app/api";
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessCode.trim()) {
      setError("Your candidate access code is required.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      // The existing API accepts the candidate code in its email field.
      const response = await fetch(`${backendUrl}/auth/quiztaker/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: accessCode.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "We could not verify that access code. Please try again.",
        );
        return;
      }
      const cookieResponse = await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.token }),
      });
      if (!cookieResponse.ok) throw new Error("Unable to secure your session.");
      localStorage.setItem("quizTaker", data.quizTaker.id);
      localStorage.setItem("quizTakerEmail", data.quizTaker.email);
      window.location.assign("/dashboard");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const pasteAccessCode = async () => {
    try {
      setAccessCode((await navigator.clipboard.readText()).trim());
      setError("");
    } catch {
      setError("Paste is unavailable. Enter your access code manually.");
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(223,243,234,0.75),transparent_31%),radial-gradient(circle_at_10%_90%,rgba(255,226,190,0.62),transparent_25%),#f9fcfb] text-[#062f25]">
      <header className="flex items-start justify-between px-2 py-2 sm:px-10 lg:px-14">
        <div className="flex items-start gap-3">
          <PortalLogo
            size={50}
            priority
            className=""
          />
          <div className="border-l border-[#dbe7e0] pl-3 py-2">
            <p className="text-xl font-black tracking-[-0.05em]">
              Student <span className="font-sm text-[#a76000]">Portal</span>
            </p>
          </div>
        </div>
        <a
          href="/support"
          className="pt-2 text-sm font-bold text-[#35403b] transition hover:text-[#a76000]"
        >
          Help Desk
        </a>
      </header>
      <section className="mx-auto flex w-full max-w-[560px] flex-col px-4 pb-6 pt-8 sm:pt-10">
        <div className="overflow-hidden rounded-xl border border-[#e1e8e4] bg-white shadow-[0_18px_45px_rgba(16,54,40,0.13)]">
          <div className="h-2 bg-gradient-to-r from-[#ff9022] via-[#ad6500] to-[#073f30]" />
          <form
            onSubmit={handleSubmit}
            className="px-5 py-7 sm:px-9 sm:py-8"
          >
            <div className="mx-auto max-w-[540px] text-center">
              
              <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#e4f7ee] px-3 py-1 text-xs font-extrabold tracking-[0.1em] text-[#063f30]">
                <span className="size-2 rounded-full bg-[#16a36a]" />
                2026/2027 SESSION
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#042e23] sm:text-4xl">
                BJOT Student Portal
              </h1>
              <p className="mx-auto mt-2 max-w-md text-base leading-6 text-[#515c57] sm:text-medium">
                Enter your premium access code to continue to your verified
                exam dashboard.
              </p>
            </div>
            <div className="mx-auto mt-6 max-w-[480px]">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="access-code"
                  className="flex items-center gap-2 text-base font-extrabold text-[#09392d]"
                >
                  <KeyRound size={19} className="text-[#a76000]" />
                  Premium Access Code
                </label>
                <button
                  type="button"
                  onClick={() => void pasteAccessCode()}
                  className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#a76000] hover:text-[#7d4900]"
                >
                  <Clipboard size={17} />
                  PASTE
                </button>
              </div>
              <div className="relative">
                <Clipboard
                  className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#87928c]"
                  size={22}
                />
                <input
                  id="access-code"
                  name="access-code"
                  value={accessCode}
                  onChange={(event) => {
                    setAccessCode(event.target.value);
                    setError("");
                  }}
                  disabled={isLoading}
                  autoComplete="username"
                  placeholder="e.g. BJOT-2026-X89K"
                  className={`w-full rounded-md border bg-[#f4f5f6] py-4 pl-16 pr-4 text-xl font-semibold tracking-[0.03em] text-[#202824] outline-none transition placeholder:text-[#808883] focus:bg-white focus:ring-4 focus:ring-[#d9eee4] disabled:cursor-not-allowed disabled:opacity-60 ${error ? "border-[#d94b38]" : "border-transparent focus:border-[#0b4b39]"}`}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#65706a]">
                <span className="flex items-center gap-1.5">
                  <Info size={17} />
                  Case-insensitive 12-character candidate key
                </span>
                <span className="font-bold">{accessCode.length} / 12</span>
              </div>
              {error && (
                <p
                  role="alert"
                  className="mt-3 rounded-md bg-[#fff1ee] px-3 py-2 text-sm font-semibold text-[#b33c2b]"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-md bg-[#074634] px-5 py-4 text-xl font-extrabold text-white shadow-[0_5px_0_#a85e00,0_10px_18px_rgba(7,70,52,0.19)] transition hover:bg-[#0b5a44] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={25} />
                ) : (
                  <>
                    Access Dashboard{" "}
                    <ArrowRight className="text-[#ff9d24]" size={28} />
                  </>
                )}
              </button>
              <div className="mt-7 rounded-md bg-[#f6f7f8] px-5 py-4 text-center text-sm text-[#56605b]">
                <p>
                  Don&apos;t have an access key?{" "}
                  <a
                    href="/support#contact"
                    className="font-extrabold text-[#a76000] hover:underline"
                  >
                    Contact Study Coordinator
                  </a>
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs font-medium">
                  <a
                    href="/support"
                    className="inline-flex items-center gap-1.5 hover:text-[#074634]"
                  >
                    <CircleHelp size={16} />
                    Verify Code Status
                  </a>
                  <a
                    href="/suppor#contact"
                    className="inline-flex items-center gap-1.5 hover:text-[#074634]"
                  >
                    <CircleHelp size={16} />
                    WhatsApp Help Desk
                  </a>
                </div>
              </div>
              <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs font-extrabold tracking-wide text-[#5c6661]">
                <ShieldCheck size={19} className="text-[#31725d]" />
                256-BIT ENCRYPTED SESSION
              </p>
            </div>
          </form>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 rounded-md bg-[#f2f3f3]/90 px-5 py-3 text-[#35423c] shadow-sm">
          <span className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded bg-[#ffeed5] text-[#a76000]">
              <Trophy size={20} />
            </span>
            <span>
              <strong className="block text-sm">
                Nigeria&apos;s Best Prep Network
              </strong>
              <span className="text-xs">
                Over 1,000+ candidates blasting UTME above 300+
              </span>
            </span>
          </span>
          <span className="hidden rounded bg-[#fff6ee] px-4 py-2 text-sm font-extrabold tracking-[0.14em] text-[#667168] sm:block">
            368 PEAK RECORD
          </span>
        </div>
      </section>
    </main>
  );
}
