"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, ChevronRight, Lock } from "lucide-react";

type Textbook = { id: string; title: string; description: string; fileSize: number; subject: { id: string; title: string } };

export default function TextbooksPage() {
  const [books, setBooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/textbooks/books", { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (response.status === 403 && data.code === "PRO_REQUIRED") { setLocked(true); return; }
        if (!response.ok) throw new Error(data.message || "Could not load textbooks");
        setBooks(data.textbooks || []);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load textbooks");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, []);

  const subjects = Array.from(new Map(books.map((book) => [book.subject.id, book.subject])).values());
  const shown = books.filter((book) => !subjectId || book.subject.id === subjectId);
  return <main className="portal-page min-h-screen px-4 py-8 text-[#17231e] sm:px-8"><div className="mx-auto max-w-5xl">
    <Link href="/dashboard" className="text-sm font-semibold text-[#15513e]">← Dashboard</Link>
    <header className="mt-5 rounded-2xl bg-[#0d3b2e] p-7 text-white">
      <BookOpen className="mb-3" aria-hidden="true" /><h1 className="text-3xl font-black">Textbooks</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#d8e6de]">Your subject textbooks, ready to read. Available with an active Pro or Pro Max plan.</p>
    </header>
    {loading && <p role="status" className="mt-6 text-sm text-[#64726a]">Loading your textbooks…</p>}
    {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {locked && <section className="mt-6 rounded-xl border border-[#dce5df] bg-white p-7">
      <Lock className="text-[#15513e]" aria-hidden="true" /><h2 className="mt-3 text-xl font-bold">Unlock your textbooks</h2>
      <p className="mt-2 text-sm text-[#64726a]">Choose an active Pro or Pro Max plan to read textbooks for the subjects you offer.</p>
      <Link href="/pricing" className="mt-5 inline-block rounded-lg bg-[#0d3b2e] px-5 py-3 text-sm font-bold text-white">View plans</Link>
    </section>}
    {!loading && !error && !locked && (books.length === 0
      ? <div className="mt-6 rounded-xl border border-[#dce5df] bg-white p-7"><h2 className="font-bold">No textbooks available yet</h2><p className="mt-2 text-sm text-[#64726a]">Textbooks will appear here when your tutors publish them for your assigned subjects.</p></div>
      : <section className="mt-6" aria-label="Your textbook library">
        <label className="text-sm font-semibold">Subject<select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="ml-3 rounded-lg border border-[#dce5df] bg-white px-3 py-2 text-sm">
          <option value="">All my subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.title}</option>)}
        </select></label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">{shown.map((book) => <article key={book.id} className="flex flex-col rounded-xl border border-[#dce5df] bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-[#15513e]">{book.subject.title}</p>
          <h2 className="mt-2 break-words text-xl font-bold">{book.title}</h2>
          {book.description && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-[#64726a]">{book.description}</p>}
          <p className="mb-5 mt-3 text-xs text-[#64726a]">Online reader</p>
          <Link href={`/textbooks/${book.id}`} className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-[#0d3b2e] px-4 py-2.5 text-sm font-bold text-white" aria-label={`Read ${book.title}`}>Read textbook <ChevronRight size={15} aria-hidden="true" /></Link>
        </article>)}</div>
      </section>)}
  </div></main>;
}
