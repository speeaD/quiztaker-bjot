"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Minus, Plus } from "lucide-react";

type Reader = { textbook: { id: string; title: string }; pageCount: number };
const buttonClass = "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg border border-[#dce5df] bg-white px-3 text-sm font-semibold disabled:opacity-40";

export default function TextbookReaderPage() {
  const { id } = useParams<{ id: string }>();
  return <TextbookReader key={id} id={id} />;
}

function TextbookReader({ id }: { id: string }) {
  const [reader, setReader] = useState<Reader | null>(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [upgrade, setUpgrade] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/textbooks/books/${id}/reader`, { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) {
          setUpgrade(data.code === "PRO_REQUIRED");
          throw new Error(data.message || "Could not open textbook");
        }
        setReader(data);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Could not open textbook"); setLoading(false);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [id, retry]);

  useEffect(() => {
    if (!reader) return;
    const controller = new AbortController();
    const target = canvas.current;
    let objectUrl: string | undefined;
    let image: HTMLImageElement | undefined;
    async function loadPage() {
      try {
        const response = await fetch(`/api/textbooks/books/${id}/pages/${page}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) {
          const data = await response.json();
          if (controller.signal.aborted) return;
          setUpgrade(data.code === "PRO_REQUIRED");
          throw new Error(data.message || "Could not load this page");
        }
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        image = new Image();
        image.onload = () => {
          if (controller.signal.aborted || !target || !image) return;
          target.width = image.naturalWidth; target.height = image.naturalHeight;
          const context = target.getContext("2d");
          if (!context) { setError("Your browser cannot display this textbook."); setLoading(false); return; }
          context.drawImage(image, 0, 0);
          setLoading(false);
        };
        image.onerror = () => { if (!controller.signal.aborted) { setError("Could not display this page. Please retry."); setLoading(false); } };
        image.src = objectUrl;
      } catch (cause) {
        if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : "Could not load this page"); setLoading(false); }
      }
    }
    void loadPage();
    return () => {
      controller.abort();
      if (image) { image.onload = null; image.onerror = null; }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      const context = target?.getContext("2d");
      if (context && target) context.clearRect(0, 0, target.width, target.height);
    };
  }, [reader, id, page]);

  function goToPage(next: number) {
    if (!reader || !Number.isInteger(next) || next === page || next < 1 || next > reader.pageCount) return;
    setLoading(true); setError(""); setUpgrade(false);
    setPage(next); setPageInput(String(next));
  }
  function jump(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToPage(Number(pageInput));
  }
  function retryReader() {
    setError(""); setUpgrade(false); setLoading(true);
    setRetry((value) => value + 1);
  }

  return <>
    <main className="portal-page min-h-screen px-4 py-6 text-[#17231e] print:hidden sm:px-8"><div className="mx-auto max-w-5xl">
      <Link href="/textbooks" className="text-sm font-semibold text-[#15513e]">← Textbooks</Link>
      <header className="mt-5 rounded-2xl bg-[#0d3b2e] p-6 text-white">
        <BookOpen className="mb-2" aria-hidden="true" /><h1 className="break-words text-2xl font-bold">{reader?.textbook.title || "Textbook reader"}</h1>
        <p className="mt-2 text-sm text-[#d8e6de]">Read your textbook here in BJOT.</p>
      </header>
      {reader && <nav aria-label="Textbook reader controls" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dce5df] bg-white p-3">
        <div className="flex items-center gap-2">
          <button className={buttonClass} onClick={() => goToPage(page - 1)} disabled={page === 1 || loading || !!error} aria-label="Previous page"><ChevronLeft size={18} /></button>
          <form onSubmit={jump} className="flex items-center gap-2 text-sm">
            <label htmlFor="textbook-page">Page</label><input id="textbook-page" type="number" min={1} max={reader.pageCount} step={1} required value={pageInput} onChange={(event) => setPageInput(event.target.value)} disabled={loading || !!error} className="w-16 rounded-lg border border-[#dce5df] px-2 py-2" />
            <span>of {reader.pageCount}</span><button type="submit" className={buttonClass} disabled={loading || !!error}>Go</button>
          </form>
          <button className={buttonClass} onClick={() => goToPage(page + 1)} disabled={page === reader.pageCount || loading || !!error} aria-label="Next page"><ChevronRight size={18} /></button>
        </div>
        <div className="flex items-center gap-2"><button className={buttonClass} onClick={() => setZoom((value) => value - 25)} disabled={zoom <= 75} aria-label="Zoom out"><Minus size={16} /></button><span className="w-12 text-center text-sm">{zoom}%</span><button className={buttonClass} onClick={() => setZoom((value) => value + 25)} disabled={zoom >= 200} aria-label="Zoom in"><Plus size={16} /></button></div>
      </nav>}
      {loading && <p role="status" className="mt-6 flex items-center gap-2 text-sm"><Loader2 size={18} className="animate-spin" aria-hidden="true" />Loading textbook page…</p>}
      {error && <div role="alert" className="mt-5 rounded-xl bg-red-50 p-5 text-sm text-red-700"><p>{error}</p>{upgrade ? <Link href="/pricing" className="mt-3 inline-block font-bold underline">View plans</Link> : <button onClick={retryReader} className="mt-3 font-bold underline">Retry</button>}</div>}
      <div className={`mt-5 overflow-auto rounded-xl border border-[#dce5df] bg-[#e8ede9] p-2 sm:p-4 ${loading || error || !reader ? "hidden" : ""}`} onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
        <canvas ref={canvas} role="img" aria-label={`${reader?.textbook.title || "Textbook"}, page ${page}`} style={{ width: `${zoom}%`, height: "auto" }} className="mx-auto block bg-white shadow-sm">Textbook page {page}</canvas>
      </div>
    </div></main>
    <p className="hidden p-8 text-center print:block">Textbooks are available to read in the BJOT student portal.</p>
  </>;
}
