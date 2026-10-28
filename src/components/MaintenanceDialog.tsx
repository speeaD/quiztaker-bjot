"use client";

import { Wrench, X } from "lucide-react";

export default function MaintenanceDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#101a15]/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="maintenance-title"
        aria-describedby="maintenance-description"
        className="relative w-full max-w-md rounded-2xl border border-[#dce5df] bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close maintenance dialog"
          className="absolute right-4 top-4 rounded-full p-2 text-[#718078] transition hover:bg-[#edf3ef] hover:text-[#0d3b2e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15513e]"
        >
          <X size={18} />
        </button>
        <span className="grid size-12 place-items-center rounded-xl bg-[#fff2d1] text-[#9a5a00]">
          <Wrench size={23} />
        </span>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9a5a00]">
          Scheduled maintenance
        </p>
        <h2 id="maintenance-title" className="mt-2 text-2xl font-black tracking-tight text-[#17231e]">
          JAMB Practice is under maintenance
        </h2>
        <p id="maintenance-description" className="mt-3 text-sm leading-6 text-[#64726a]">
          We’re working on this feature. Please check back later; your other learning tools are still available.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#0d3b2e] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#15513e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15513e]"
        >
          Got it
        </button>
      </section>
    </div>
  );
}
