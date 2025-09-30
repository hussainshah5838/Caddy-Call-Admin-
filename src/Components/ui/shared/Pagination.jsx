import React, { useMemo } from "react";

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Props:
 * - page (1-based)
 * - pageSize
 * - total
 * - onPageChange(newPage)
 */
export default function Pagination({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const { start, end } = useMemo(() => {
    const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIdx = Math.min(total, page * pageSize);
    return { start: startIdx, end: endIdx };
  }, [page, pageSize, total]);

  // generate compact page list: 1 … current-1, current, current+1 … last
  const pages = useMemo(() => {
    if (totalPages <= 7) return range(1, totalPages);
    const set = new Set([
      1,
      2,
      totalPages,
      totalPages - 1,
      page - 1,
      page,
      page + 1,
    ]);
    const sorted = [...set]
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);
    const res = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) res.push(sorted[i]);
      else {
        const prev = sorted[i - 1];
        const cur = sorted[i];
        if (cur - prev > 1) res.push("…");
        res.push(cur);
      }
    }
    return res;
  }, [page, totalPages]);

  const go = (p) => {
    if (!onPageChange) return;
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) onPageChange(next);
  };

  return (
    <div
      className={`flex flex-col items-center gap-2 sm:flex-row sm:justify-between ${className}`}
    >
      <div className="text-xs text-gray-500">
        {total === 0 ? "No items" : `Showing ${start}-${end} of ${total}`}
      </div>

      <div className="inline-flex items-center gap-1">
        <button
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="px-2.5 py-1.5 text-sm rounded-md border border-gray-200 text-gray-700 disabled:opacity-50"
        >
          Prev
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-2 text-gray-400 select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => go(p)}
              className={`min-w-[36px] px-2.5 py-1.5 text-sm rounded-md border
                ${
                  p === page
                    ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className="px-2.5 py-1.5 text-sm rounded-md border border-gray-200 text-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
