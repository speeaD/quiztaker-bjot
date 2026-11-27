"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Minus, Plus } from "lucide-react";
import { TextbookPageCache, TextbookPageError } from "@/lib/textbook-page-cache";

type Reader = { textbook: { id: string; title: string }; pageCount: number; pages: TextbookPageCache };
const buttonClass = "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#dce5df] bg-white px-3 text-sm font-semibold disabled:opacity-40";

export default function TextbookReaderPage() {
  const { id } = useParams<{ id: string }>();
  return <TextbookReader key={id} id={id} />;
}

function TextbookReader({ id }: { id: string }) {
  const [reader, setReader] = useState<Reader | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [upgrade, setUpgrade] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let pages: TextbookPageCache | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;
    let checking = false;
    const denied = (reason: TextbookPageError) => {
      pages?.dispose(); setError(reason.message); setUpgrade(reason.code === "PRO_REQUIRED"); setReader(null);
    };
    async function metadata() {
      const response = await fetch(`/api/textbooks/books/${id}/reader`, { cache: "no-store", signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new TextbookPageError(data.message || "Could not open textbook", response.status, data.code);
      return data;
    }
    async function checkAccess() {
      if (checking || controller.signal.aborted || document.hidden) return;
      checking = true;
      try {
        // Recheck eligibility without reparsing the PDF while cached pages are being read.
        const response = await fetch("/api/textbooks/books", { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new TextbookPageError(data.message || "Unable to verify textbook access.", response.status, data.code);
        if (!data.textbooks?.some((book: { id: string }) => book.id === id)) throw new TextbookPageError("This textbook is no longer available for your subjects.", 404);
      }
      catch (cause) {
        if (!controller.signal.aborted && cause instanceof TextbookPageError && [401, 403, 404].includes(cause.status)) denied(cause);
      } finally { checking = false; }
    }
    async function load() {
      try {
        const data = await metadata();
        if (controller.signal.aborted) return;
        pages = new TextbookPageCache({
          pageCount: data.pageCount,
          fetchPage: async (page, signal) => {
            const response = await fetch(`/api/textbooks/books/${id}/pages/${page}`, { cache: "no-store", signal });
            if (!response.ok) {
              const result = await response.json();
              throw new TextbookPageError(result.message || "Could not prepare this page.", response.status, result.code);
            }
            if (!response.headers.get("Content-Type")?.startsWith("image/webp")) throw new TextbookPageError("Could not display this page.", 502);
            return response.blob();
          },
          onAccessDenied: denied,
        });
        setReader({ ...data, pages }); pages.start();
        interval = setInterval(() => void checkAccess(), 60000);
        window.addEventListener("focus", checkAccess);
        document.addEventListener("visibilitychange", checkAccess);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Could not open textbook");
          setUpgrade(cause instanceof TextbookPageError && cause.code === "PRO_REQUIRED");
        }
      }
    }
    void load();
    return () => {
      controller.abort(); pages?.dispose(); clearInterval(interval);
      window.removeEventListener("focus", checkAccess); document.removeEventListener("visibilitychange", checkAccess);
    };
  }, [id, retry]);

  function retryReader() { setReader(null); setError(""); setUpgrade(false); setRetry((value) => value + 1); }
  return <>
    <main className="portal-page min-h-screen px-4 py-6 text-[#17231e] print:hidden sm:px-8"><div className="mx-auto max-w-5xl">
      <Link href="/textbooks" className="text-sm font-semibold text-[#15513e]">← Textbooks</Link>
      <header className="mt-5 rounded-2xl bg-[#0d3b2e] p-6 text-white">
        <BookOpen className="mb-2" aria-hidden="true" /><h1 className="break-words text-2xl font-bold">{reader?.textbook.title || "Textbook reader"}</h1>
        <p className="mt-2 text-sm text-[#d8e6de]">Scroll through your textbook, or jump to any page.</p>
      </header>
      {!reader && !error && <p role="status" className="mt-6 flex items-center gap-2 text-sm"><Loader2 size={18} className="animate-spin" aria-hidden="true" />Opening textbook…</p>}
      {error && <div role="alert" className="mt-5 rounded-xl bg-red-50 p-5 text-sm text-red-700"><p>{error}</p>{upgrade ? <Link href="/pricing" className="mt-3 inline-block font-bold underline">View plans</Link> : <button onClick={retryReader} className="mt-3 font-bold underline">Retry</button>}</div>}
      {reader && <ContinuousBook key={retry} reader={reader} />}
    </div></main>
    <p className="hidden p-8 text-center print:block">Textbooks are available to read in the BJOT student portal.</p>
  </>;
}

function ContinuousBook({ reader }: { reader: Reader }) {
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [zoom, setZoom] = useState(100);
  const [nearPages, setNearPages] = useState(() => new Set([1, 2, 3]));
  const viewport = useRef<HTMLDivElement>(null);
  const elements = useRef(new Map<number, HTMLElement>());
  const scrollFrame = useRef<number | null>(null);
  const currentPage = useRef(1);
  const register = useCallback((page: number, element: HTMLElement | null) => {
    if (element) elements.current.set(page, element); else elements.current.delete(page);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      setNearPages((previous) => {
        const next = new Set(previous);
        for (const entry of entries) {
          const page = Number((entry.target as HTMLElement).dataset.page);
          if (entry.isIntersecting) next.add(page); else next.delete(page);
        }
        return next;
      });
    }, { root: viewport.current, rootMargin: "150% 0px" });
    elements.current.forEach((element) => observer.observe(element));
    return () => { observer.disconnect(); if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current); };
  }, []);

  function trackReadingPosition() {
    if (scrollFrame.current !== null) return;
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = null;
      const root = viewport.current;
      if (!root) return;
      const readingLine = root.getBoundingClientRect().top + Math.min(180, root.clientHeight / 3);
      let low = 1, high = reader.pageCount;
      while (low < high) {
        const middle = Math.floor((low + high) / 2);
        const element = elements.current.get(middle);
        if (element && element.getBoundingClientRect().bottom < readingLine) low = middle + 1;
        else high = middle;
      }
      if (low !== currentPage.current) {
        currentPage.current = low; setPage(low); setPageInput(String(low)); reader.pages.prepareAround(low);
      }
    });
  }
  function goToPage(next: number) {
    const root = viewport.current, target = elements.current.get(next);
    if (!root || !target || !Number.isInteger(next)) return;
    reader.pages.prepareAround(next); currentPage.current = next; setPage(next); setPageInput(String(next));
    root.scrollTo({ top: root.scrollTop + target.getBoundingClientRect().top - root.getBoundingClientRect().top - 12 });
  }
  function jump(event: FormEvent<HTMLFormElement>) { event.preventDefault(); goToPage(Number(pageInput)); }

  return <>
    <nav aria-label="Textbook reader controls" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-t-xl border border-[#dce5df] bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className={buttonClass} onClick={() => goToPage(page - 1)} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={18} /></button>
        <form onSubmit={jump} className="flex items-center gap-2 text-sm">
          <label htmlFor="textbook-page" className="sr-only sm:not-sr-only">Page</label>
          <input id="textbook-page" type="number" min={1} max={reader.pageCount} step={1} required value={pageInput} onChange={(event) => setPageInput(event.target.value)} className="w-14 rounded-lg border border-[#dce5df] px-2 py-2" />
          <span>of {reader.pageCount}</span><button type="submit" className={buttonClass}>Go</button>
        </form>
        <button className={buttonClass} onClick={() => goToPage(page + 1)} disabled={page === reader.pageCount} aria-label="Next page"><ChevronRight size={18} /></button>
      </div>
      <div className="flex items-center gap-2"><button className={buttonClass} onClick={() => setZoom((value) => value - 25)} disabled={zoom <= 75} aria-label="Zoom out"><Minus size={16} /></button><span className="w-12 text-center text-sm">{zoom}%</span><button className={buttonClass} onClick={() => setZoom((value) => value + 25)} disabled={zoom >= 200} aria-label="Zoom in"><Plus size={16} /></button></div>
    </nav>
    <div ref={viewport} role="region" aria-label="Textbook pages" tabIndex={0} onScroll={trackReadingPosition}
      className="h-[70vh] min-h-[320px] overflow-auto overscroll-contain rounded-b-xl border border-t-0 border-[#dce5df] bg-[#e8ede9] p-3 outline-offset-2 sm:p-5"
      onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
      <div className="mx-auto space-y-5" style={{ width: `${zoom}%` }}>
        {Array.from({ length: reader.pageCount }, (_, index) => <BookPage key={index + 1} page={index + 1} title={reader.textbook.title} cache={reader.pages} near={nearPages.has(index + 1)} register={register} />)}
      </div>
    </div>
  </>;
}

const BookPage = memo(function BookPage({ page, title, cache, near, register }: {
  page: number; title: string; cache: TextbookPageCache; near: boolean;
  register: (page: number, element: HTMLElement | null) => void;
}) {
  const subscribe = useCallback((listener: () => void) => cache.subscribe(page, listener), [cache, page]);
  const getSnapshot = useCallback(() => cache.getSnapshot(page), [cache, page]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [ratio, setRatio] = useState(1 / Math.SQRT2);
  const ref = useCallback((element: HTMLElement | null) => register(page, element), [register, page]);
  useEffect(() => near ? cache.pin(page) : undefined, [cache, near, page]);

  return <article ref={ref} data-page={page} aria-label={`Page ${page}`} className="overflow-hidden rounded-sm bg-white shadow-sm">
    <div className="relative" style={{ paddingBottom: `${100 / ratio}%` }}>
      {near && (state.status === "ready" ? <PageCanvas key={state.url} url={state.url} page={page} title={title} onRatio={setRatio} /> :
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center text-sm text-[#64726a]">
          {state.status === "error" ? <><p>{state.message}</p><button className="font-bold text-[#15513e] underline" onClick={() => cache.retry(page)}>Retry page {page}</button></> : <><Loader2 size={20} className="animate-spin" aria-hidden="true" /><span>Preparing page {page}…</span></>}
        </div>)}
    </div>
    <p className="border-t border-[#edf1ee] py-2 text-center text-xs text-[#64726a]">{page}</p>
  </article>;
});

function PageCanvas({ url, page, title, onRatio }: { url: string; page: number; title: string; onRatio: (ratio: number) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const target = canvas.current;
    if (!target) return;
    let stopped = false;
    const image = new Image();
    image.onload = () => {
      if (stopped) return;
      target.width = image.naturalWidth; target.height = image.naturalHeight;
      const context = target.getContext("2d");
      if (!context) { setError("Your browser cannot display this page."); return; }
      context.drawImage(image, 0, 0); onRatio(image.naturalWidth / image.naturalHeight); setDrawn(true);
    };
    image.onerror = () => { if (!stopped) setError("Could not display this page. Please reopen the textbook."); };
    image.src = url;
    return () => { stopped = true; image.onload = null; image.onerror = null; target.width = 0; target.height = 0; };
  }, [url, onRatio]);
  return <>
    <canvas ref={canvas} role="img" aria-label={`${title}, page ${page}`} className="absolute inset-0 h-full w-full">Textbook page {page}</canvas>
    {!drawn && <div className="absolute inset-0 flex items-center justify-center bg-white p-5 text-sm text-[#64726a]">{error ? <p role="alert">{error}</p> : <Loader2 size={20} className="animate-spin" aria-label={`Preparing page ${page}`} />}</div>}
  </>;
}
