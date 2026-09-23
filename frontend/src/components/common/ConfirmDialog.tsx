"use client";

import { buttonStyles } from "../ui/ButtonStyles";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "primary",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition hover:bg-slate-800"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className={
              confirmTone === "danger"
                ? "rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-400"
                : buttonStyles.primary
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}