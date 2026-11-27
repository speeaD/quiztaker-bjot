export type TextbookPageState =
  | { status: "idle" | "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

const IDLE: TextbookPageState = { status: "idle" };
const LOADING: TextbookPageState = { status: "loading" };
const MEMORY_LIMIT = 64 * 1024 * 1024;

export class TextbookPageError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 0, code?: string) {
    super(message); this.status = status; this.code = code;
  }
}

type Options = {
  pageCount: number;
  fetchPage: (page: number, signal: AbortSignal) => Promise<Blob>;
  onAccessDenied: (error: TextbookPageError) => void;
  maximumBytes?: number;
  retryDelayMs?: number;
  createUrl?: (blob: Blob) => string;
  revokeUrl?: (url: string) => void;
};

// A reader session owns its URLs. Nothing is persisted or shared across accounts.
export class TextbookPageCache {
  private options: Options;
  private states = new Map<number, TextbookPageState>();
  private sizes = new Map<number, number>();
  private listeners = new Map<number, Set<() => void>>();
  private pinned = new Set<number>();
  private queue = new Set<number>();
  private controller = new AbortController();
  private bytes = 0;
  private focus = 1;
  private backgroundPage = 1;
  private backgroundPaused = false;
  private started = false;
  private pumping = false;
  private stopped = false;

  constructor(options: Options) { this.options = options; }
  getSnapshot = (page: number): TextbookPageState => this.states.get(page) || IDLE;
  subscribe(page: number, listener: () => void) {
    let listeners = this.listeners.get(page);
    if (!listeners) { listeners = new Set(); this.listeners.set(page, listeners); }
    listeners.add(listener);
    return () => { listeners.delete(listener); if (!listeners.size) this.listeners.delete(page); };
  }
  start() { this.started = true; this.prepareAround(1); }

  prepareAround(page: number) {
    if (!this.valid(page) || this.stopped) return;
    this.focus = page; this.queue.clear();
    // Visible pages and jumps take precedence over the rest of the book.
    for (const next of [page, page + 1, page + 2, page + 3, page + 4, page + 5, page - 1, ...this.pinned]) {
      if (this.valid(next) && this.getSnapshot(next).status === "idle") this.queue.add(next);
    }
    void this.pump();
  }
  pin(page: number) {
    this.pinned.add(page);
    if (this.getSnapshot(page).status === "idle") { this.queue.add(page); void this.pump(); }
    return () => { this.pinned.delete(page); };
  }
  retry(page: number) {
    if (this.stopped || this.getSnapshot(page).status !== "error") return;
    this.publish(page, IDLE); this.prepareAround(page);
  }
  dispose() {
    this.stopped = true; this.controller.abort(); this.listeners.clear(); this.clear();
  }

  private valid(page: number) { return Number.isInteger(page) && page >= 1 && page <= this.options.pageCount; }
  private publish(page: number, state: TextbookPageState) {
    this.states.set(page, state); this.listeners.get(page)?.forEach((listener) => listener());
  }
  private revoke(url: string) { (this.options.revokeUrl || URL.revokeObjectURL)(url); }
  private clear() {
    for (const [page, state] of this.states) {
      if (state.status === "ready") this.revoke(state.url);
      this.publish(page, IDLE);
    }
    this.states.clear(); this.sizes.clear(); this.queue.clear(); this.pinned.clear(); this.bytes = 0;
  }
  private next(): { page: number; background: boolean } | null {
    for (const page of this.queue) {
      this.queue.delete(page);
      if (this.getSnapshot(page).status === "idle") return { page, background: false };
    }
    // Warm the remaining book once, without repeatedly fetching evicted pages.
    if (this.backgroundPaused || this.bytes >= (this.options.maximumBytes ?? MEMORY_LIMIT) * 0.85) return null;
    while (this.backgroundPage <= this.options.pageCount) {
      const page = this.backgroundPage++;
      if (this.getSnapshot(page).status === "idle") return { page, background: true };
    }
    return null;
  }
  private async pause(ms: number) {
    const signal = this.controller.signal;
    await new Promise<void>((resolve, reject) => {
      if (signal.aborted) { reject(new DOMException("Reader closed", "AbortError")); return; }
      const abort = () => { clearTimeout(timer); reject(new DOMException("Reader closed", "AbortError")); };
      const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
      signal.addEventListener("abort", abort, { once: true });
    });
  }
  private async fetch(page: number) {
    for (let attempt = 0; ; attempt++) {
      try { return await this.options.fetchPage(page, this.controller.signal); }
      catch (error) {
        if (this.stopped || this.controller.signal.aborted || attempt >= 2 ||
          (error instanceof TextbookPageError && error.status > 0 && error.status < 500)) throw error;
        await this.pause((this.options.retryDelayMs ?? 400) * (attempt + 1));
      }
    }
  }
  private store(page: number, blob: Blob, background: boolean) {
    const maximum = this.options.maximumBytes ?? MEMORY_LIMIT;
    if (background && this.bytes + blob.size > maximum) {
      this.backgroundPaused = true; this.publish(page, IDLE); return;
    }
    while (this.bytes + blob.size > maximum) {
      let victim: number | undefined;
      for (const candidate of this.sizes.keys()) {
        if (!this.pinned.has(candidate) && (victim === undefined || Math.abs(candidate - this.focus) > Math.abs(victim - this.focus))) victim = candidate;
      }
      if (victim === undefined) break; // Keep pages being drawn alive until they leave view.
      const state = this.getSnapshot(victim);
      if (state.status === "ready") this.revoke(state.url);
      this.bytes -= this.sizes.get(victim)!; this.sizes.delete(victim); this.publish(victim, IDLE);
    }
    const url = (this.options.createUrl || URL.createObjectURL)(blob);
    this.bytes += blob.size; this.sizes.set(page, blob.size); this.publish(page, { status: "ready", url });
  }
  private async pump() {
    if (!this.started || this.pumping || this.stopped) return;
    this.pumping = true;
    try {
      let next;
      // One request at a time leaves rendering capacity for other students.
      while (!this.stopped && (next = this.next())) {
        const { page, background } = next;
        this.publish(page, LOADING);
        try {
          const blob = await this.fetch(page);
          if (!this.stopped) this.store(page, blob, background);
        } catch (error) {
          if (this.stopped) return;
          if (error instanceof TextbookPageError && [401, 403, 404].includes(error.status)) {
            this.stopped = true; this.controller.abort(); this.clear(); this.options.onAccessDenied(error); return;
          }
          this.publish(page, { status: "error", message: error instanceof Error ? error.message : "Could not prepare this page." });
        }
      }
    } finally { this.pumping = false; }
  }
}
