import React from "react";
import { MdClose } from "react-icons/md";

export default function MenuCsvImportResultModal({
  open,
  onClose,
  created = 0,
  failed = 0,
  errors = [],
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/35 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-csv-import-result-title"
    >
      <div
        className="fixed inset-0 z-0 cursor-default"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="relative z-10 mt-8 w-full max-w-lg rounded-xl bg-white shadow-xl sm:mt-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-5">
          <h2
            id="menu-csv-import-result-title"
            className="text-base font-semibold text-gray-900"
          >
            Import results
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
              <span className="font-semibold text-emerald-900">Imported</span>
              <p className="text-2xl font-semibold text-emerald-800">{created}</p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm">
              <span className="font-semibold text-rose-900">Not imported</span>
              <p className="text-2xl font-semibold text-rose-800">{failed}</p>
            </div>
          </div>

          {errors.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-gray-900">Row errors</p>
              <ul className="mt-2 max-h-48 list-inside list-disc space-y-1 overflow-y-auto text-sm text-gray-600">
                {errors.map((err, idx) => (
                  <li key={`${err.row}-${idx}`}>
                    Row {err.row}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="border-t border-gray-200 px-4 py-3 sm:px-5 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
