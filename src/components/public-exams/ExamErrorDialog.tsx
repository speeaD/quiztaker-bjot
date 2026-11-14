"use client";

import { AlertCircle, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

export default function ExamErrorDialog({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const acknowledgeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    acknowledgeRef.current?.focus();
    return () => dialog.close();
  }, []);

  const dismiss = () => {
    dialogRef.current?.close();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      className="fixed m-auto max-h-[calc(100vh-2rem)] supports-[height:100dvh]:max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-[#dce5df] bg-white p-6 text-[#17231e] shadow-2xl backdrop:bg-[#101a15]/60 backdrop:backdrop-blur-sm sm:p-8"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close error dialog"
        className="absolute right-4 top-4 rounded-full p-2 text-[#718078] transition hover:bg-[#edf3ef] hover:text-[#0d3b2e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15513e]"
      >
        <X size={18} />
      </button>
      <span className="grid size-12 place-items-center rounded-xl bg-[#fff0ec] text-[#a8451f]">
        <AlertCircle size={24} aria-hidden="true" />
      </span>
      <h2 id={titleId} className="mt-5 text-2xl font-black tracking-tight">
        Unable to continue
      </h2>
      <p id={descriptionId} className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#64726a]">
        {message}
      </p>
      <button
        ref={acknowledgeRef}
        type="button"
        onClick={dismiss}
        className="mt-6 w-full rounded-lg bg-[#0d3b2e] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#15513e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15513e]"
      >
        Got it
      </button>
    </dialog>
  );
}
