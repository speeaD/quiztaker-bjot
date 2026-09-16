"use client";

import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PortalLogo from "@/components/PortalLogo";
import { QuestionSet } from "@/types/global";

const inputClass =
  "w-full rounded-xl border border-[#bdcadb] bg-[#fbfcff] py-3 pl-11 pr-4 text-sm text-[#10213b] outline-none transition placeholder:text-[#8b9db9] focus:border-[#0a4a37] focus:bg-white focus:ring-4 focus:ring-[#d9eee4] disabled:cursor-not-allowed disabled:opacity-60";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [firstJamb, setFirstJamb] = useState(true);
  const [lastJambScore, setLastJambScore] = useState(0);
  const [selectedQuestionSets, setSelectedQuestionSets] = useState<string[]>(
    [],
  );
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/question-set", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error();
        setQuestionSets(await response.json());
      } catch {
        setError("Failed to load question sets. Please try again later.");
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    void load();
  }, []);
  const toggleSubject = (id: string) =>
    setSelectedQuestionSets((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length < 4) return [...current, id];
      setError("Select exactly four subjects for your combination.");
      return current;
    });
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedQuestionSets.length !== 4) {
      setError("Please select exactly four subjects.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstname: name.split(" ")[0],
          lastname: name.split(" ").slice(1).join(" "),
          phone: parseInt(phone) || 0,
          parentName,
          parentPhone: parseInt(parentPhone) || 0,
          department,
          course,
          firstJamb,
          lastJambScore: firstJamb ? 0 : lastJambScore,
          selectedQuestionSets,
          accountType: "premium",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");
      router.push("/login");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "An unknown error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const disabled = isSubmitting || isLoadingSubjects;
  return (
    <main className="min-h-screen bg-[#f5faf7] text-[#071b34]">
      <header className="flex h-16 items-center justify-between border-b border-[#dce7e3] bg-white px-5 sm:px-10">
        <PortalLogo
          size={100}
          priority
          className=""
        />
        <nav className="flex items-center gap-4 text-xs text-[#445b7e]">
          <span className="hidden sm:inline">Already have an access key?</span>
          <a
            href="/login"
            className="rounded-lg border border-[#bdc8d1] px-4 py-2 font-bold tracking-wide text-[#092235] transition hover:border-[#0a4a37] hover:text-[#0a4a37]"
          >
            SIGN IN
          </a>
          <a
            href="/support"
            className="hidden items-center gap-1.5 font-bold tracking-wide text-[#34465e] hover:text-[#a76000] sm:inline-flex"
          >
            <CircleHelp size={15} className="text-[#e9971c]" />
            HELP DESK
          </a>
        </nav>
      </header>
      <section className="mx-auto w-full max-w-[720px] px-4 py-10 sm:py-12">
        <div className="overflow-hidden rounded-2xl border border-[#dce5e0] bg-white shadow-[0_10px_28px_rgba(11,69,51,0.11)]">
          <div className="h-2 bg-gradient-to-r from-[#084635] via-[#0a4a37] to-[#efa51d]" />
          <form onSubmit={submit} className="px-6 py-10 sm:px-11">
            <div className="text-center">
              
              <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-[#8ce3bb] bg-[#effcf5] px-3 py-1 text-[10px] font-extrabold tracking-[0.1em] text-[#07583e]">
                <span className="size-1.5 rounded-full bg-[#14b879]" />
                2026/2027 UTME SESSION ENROLLMENT
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.05em]">
                BJOT Registration
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#536b91]">
                Enter your information and select your subject combination to
                get verified access to the BJOT Student Portal.
              </p>
            </div>
            <div className="mt-9 space-y-5">
              <Field label="Email address" required icon={Mail}>
                <input
                  required
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                  disabled={disabled}
                />
              </Field>
              <Field
                label="Full name (firstname and lastname)"
                required
                icon={User}
              >
                <input
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClass}
                  disabled={disabled}
                />
              </Field>
              <Field label="Phone number" icon={Phone}>
                <input
                  type="tel"
                  placeholder="08012345678"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClass}
                  disabled={disabled}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Parent/Guardian name" icon={Users}>
                  <input
                    placeholder="Parent Name"
                    value={parentName}
                    onChange={(event) => setParentName(event.target.value)}
                    className={inputClass}
                    disabled={disabled}
                  />
                </Field>
                <Field label="Parent/Guardian phone number" icon={Phone}>
                  <input
                    type="tel"
                    placeholder="08012345678"
                    value={parentPhone}
                    onChange={(event) => setParentPhone(event.target.value)}
                    className={inputClass}
                    disabled={disabled}
                  />
                </Field>
              </div>
              <Field label="Department" icon={GraduationCap}>
                <ChevronDown
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#536b91]"
                  size={17}
                />
                <select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className={`${inputClass} appearance-none`}
                  disabled={disabled}
                >
                  <option value="">Select Department</option>
                  <option value="Sciences">Sciences</option>
                  <option value="Arts">Arts</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </Field>
              <Field label="Intended course of study" icon={BookOpen}>
                <input
                  placeholder="e.g., Medicine & Surgery, Computer Science, Law"
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                  className={inputClass}
                  disabled={disabled}
                />
              </Field>
              <fieldset className="border-y border-[#e7edf2] py-4">
                <legend className="text-[11px] font-extrabold uppercase tracking-wide">
                  Is this your first JAMB exam?
                </legend>
                <div className="mt-3 flex items-center gap-7 text-sm">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={firstJamb}
                      onChange={() => setFirstJamb(true)}
                      disabled={disabled}
                      className="size-4 accent-[#084635]"
                    />
                    Yes
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={!firstJamb}
                      onChange={() => setFirstJamb(false)}
                      disabled={disabled}
                      className="size-4 accent-[#084635]"
                    />
                    No
                  </label>
                </div>
              </fieldset>
              {!firstJamb && (
                <Field label="Last JAMB score" icon={Trophy}>
                  <input
                    type="number"
                    min="0"
                    max="400"
                    placeholder="Enter your last JAMB score"
                    value={lastJambScore || ""}
                    onChange={(event) =>
                      setLastJambScore(parseInt(event.target.value) || 0)
                    }
                    className={inputClass}
                    disabled={disabled}
                  />
                </Field>
              )}
              <section>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[11px] font-extrabold uppercase tracking-wide">
                      Select your subject combination{" "}
                      <span className="text-[#df3e32]">*</span>
                    </h2>
                    <p className="mt-1 text-xs text-[#657aa0]">
                      Choose exactly 4 subjects including compulsory English
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${selectedQuestionSets.length === 4 ? "border-[#ffc76a] bg-[#fff8eb] text-[#07583e]" : "border-[#d7e1ec] bg-[#f7f9fc] text-[#566b8d]"}`}
                  >
                    Selected: <b>{selectedQuestionSets.length} / 4</b>
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {isLoadingSubjects ? (
                    <div className="col-span-full flex justify-center py-8 text-sm text-[#657aa0]">
                      <Loader2 className="mr-2 animate-spin" size={18} />
                      Loading subjects…
                    </div>
                  ) : (
                    questionSets.map((subject) => {
                      const selected = selectedQuestionSets.includes(
                        subject._id,
                      );
                      const unavailable =
                        !selected && selectedQuestionSets.length >= 4;
                      return (
                        <label
                          key={subject._id}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${selected ? "border-[#062f25] bg-[#f1f8f4] text-[#061d17]" : "border-[#d4dfeb] bg-white hover:border-[#84aa98]"} ${unavailable ? "cursor-not-allowed opacity-55" : ""}`}
                        >
                          <span>
                            {subject.title}
                            {subject.title.toLowerCase() === "english" && (
                              <span className="ml-2 rounded bg-[#fff1bc] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-[#a55200]">
                                COMPULSORY
                              </span>
                            )}
                          </span>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSubject(subject._id)}
                            disabled={disabled || unavailable}
                            className="sr-only"
                          />
                          <span
                            className={`grid size-5 place-items-center rounded-md border ${selected ? "border-[#063f30] bg-[#084635] text-white" : "border-[#bdcadb] text-transparent"}`}
                          >
                            <Check size={14} />
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </section>
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-[#fff1ee] px-4 py-3 text-sm font-semibold text-[#b33c2b]"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={
                  disabled ||
                  !email ||
                  !name ||
                  selectedQuestionSets.length !== 4
                }
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#084635] py-4 text-base font-extrabold text-white shadow-[0_6px_14px_rgba(7,70,52,0.25)] transition hover:bg-[#0c5c45] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Registering…
                  </>
                ) : (
                  <>
                    Register for BJOT Portal{" "}
                    <ArrowRight className="text-[#ffb12d]" size={21} />
                  </>
                )}
              </button>
              <div className="pt-3 text-center">
                <p className="flex justify-center gap-2 text-[11px] font-medium text-[#536b91]">
                  <ShieldCheck size={15} className="text-[#0c9365]" />
                  256-BIT ENCRYPTED
                  SESSION
                </p>
                <p className="mt-2 text-[11px] text-[#8a9ab2]">
                  Already registered?{" "}
                  <a
                    href="/login"
                    className="font-bold text-[#0a261e] hover:underline"
                  >
                    Sign In with Premium Access Code
                  </a>
                </p>
              </div>
            </div>
          </form>
        </div>
        <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-[#dce5e0] bg-white px-5 py-4 text-xs shadow-sm">
          <span className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-[#ffd976] bg-[#fffaf0] text-[#a76000]">
              <Star size={17} fill="currentColor" />
            </span>
            <span>
              <strong className="block text-[#1b2635]">
                NIGERIA&apos;S BEST UTME PREP NETWORK
              </strong>
              <span className="text-[#667895]">
                Over 1,000+ candidates blasting UTME above 300+
              </span>
            </span>
          </span>
          <span className="hidden items-center gap-2 rounded-lg border border-[#ffd976] bg-[#fffaf0] px-3 py-2 font-extrabold tracking-wide text-[#9c4e00] sm:flex">
            <Trophy size={15} />
            368 PEAK RECORD
          </span>
        </div>
      </section>
      <footer className="flex flex-col gap-3 border-t border-[#dce7e3] bg-white px-7 py-7 text-[11px] text-[#61728d] sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 BJOT Blast JAMB Online Tutorials. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="/support">Support Desk</a>
        </div>
      </footer>
    </main>
  );
}

function Field({
  label,
  required = false,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide">
        {label}
        {required && <span className="text-[#df3e32]"> *</span>}
      </span>
      <span className="relative block">
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7690b2]"
          size={18}
        />
        {children}
      </span>
    </label>
  );
}
