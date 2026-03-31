import React from "react";
import { MdClose, MdOutlineUploadFile } from "react-icons/md";
import { getProShopImportCsvTemplate } from "./proShopImportTemplate";
import { isAllowedMenuImportFilename } from "../menu/menuCsvTemplate";
import { postProShopImport } from "../../utils/proShopImportApi";

const COLUMN_ROWS = [
  "Item Name (required)",
  "Price (required)",
  "Description (optional)",
  "Category (required)",
  "Image URL (optional)",
  "Image Alt Text (optional)",
  "Status (optional, default to Active)",
];

function downloadTemplateCsv() {
  const csv = getProShopImportCsvTemplate();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pro-shop-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {string} [scopedCourseId] - Super Admin on pro-shop/:id — sent as `course` (ObjectId). Omit for course admin.
 * @param {() => void} [onImported]
 * @param {(payload: { created: number, failed: number, errors: object[] }) => void} [onImportFinished]
 */
export default function UploadProShopFileModal({
  open,
  onClose,
  scopedCourseId,
  onImported,
  onImportFinished,
}) {
  const inputRef = React.useRef(null);
  const [file, setFile] = React.useState(null);
  const [fileName, setFileName] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [importError, setImportError] = React.useState("");

  const isSuperScoped = scopedCourseId !== undefined;
  const courseReady =
    !isSuperScoped || String(scopedCourseId || "").trim() !== "";
  const canImport = Boolean(file) && !uploading && courseReady;

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

  React.useEffect(() => {
    if (!open) return;
    setFile(null);
    setFileName("");
    setImportError("");
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }, [open]);

  const setFileFromInput = (f) => {
    if (f && isAllowedMenuImportFilename(f.name)) {
      setFile(f);
      setFileName(f.name);
    } else {
      setFile(null);
      setFileName("");
    }
  };

  const handleImport = async () => {
    if (!file || !canImport) return;
    setImportError("");
    setUploading(true);
    try {
      const data = await postProShopImport(
        file,
        isSuperScoped ? String(scopedCourseId).trim() : undefined
      );
      onImported?.();
      onImportFinished?.({
        created: data.created ?? 0,
        failed: data.failed ?? 0,
        errors: Array.isArray(data.errors) ? data.errors : [],
      });
      onClose();
    } catch (err) {
      setImportError(err?.message || "Import failed.");
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/35 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-pro-shop-file-title"
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
            id="upload-pro-shop-file-title"
            className="text-base font-semibold text-gray-900"
          >
            Upload Pro Shop (CSV or Excel)
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
          <p className="text-sm text-gray-600">
            Upload a CSV or Excel file (.xlsx, .xls) to import multiple pro shop
            items at once.
          </p>

          {isSuperScoped && !courseReady ? (
            <p className="text-sm text-amber-800">
              Loading course… import is available once the course is ready.
            </p>
          ) : null}

          {importError ? (
            <p className="text-sm text-rose-600">{importError}</p>
          ) : null}

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Required columns:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
              {COLUMN_ROWS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFileFromInput(f);
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const f = e.dataTransfer.files?.[0];
                setFileFromInput(f);
              }}
              className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/80 px-4 py-10 text-center transition hover:border-gray-400 hover:bg-gray-50"
            >
              <MdOutlineUploadFile className="mb-2 h-10 w-10 text-gray-400" />
              <span className="text-sm font-semibold text-gray-900">
                Click or drag file to this area to upload
              </span>
              <span className="mt-1 text-xs text-gray-500">
                CSV or Excel (.csv, .xlsx, .xls). Maximum file size: 10MB
              </span>
              {fileName ? (
                <span className="mt-3 max-w-full truncate text-xs text-gray-700">
                  Selected: {fileName}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-y-2 sm:px-5 sm:py-4">
          <button
            type="button"
            onClick={downloadTemplateCsv}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Download CSV template
          </button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canImport}
              onClick={handleImport}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Importing…" : "Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
