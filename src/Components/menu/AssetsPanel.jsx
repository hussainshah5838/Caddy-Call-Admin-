import React, { useRef } from "react";

export default React.memo(function AssetsPanel({ assets, onUpload }) {
  const inputRef = useRef(null);

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload?.(file);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="text-sm font-semibold text-gray-900 mb-4">
        Visual Assets
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500"
      >
        <div className="mb-2">Drag & Drop or Click to Upload</div>
        <div className="text-xs text-gray-400">Supports JPG, PNG, SVG</div>
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm"
        >
          Choose File
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files?.[0] && onUpload?.(e.target.files[0])}
        />
      </div>

      {/* Grid */}
      <div className="mt-4">
        <div className="text-xs text-gray-600 mb-2">
          Existing Assets ({assets.length})
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {assets.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-gray-200 bg-white p-2"
            >
              <img
                src={a.src}
                alt={a.label}
                className="h-24 w-full rounded-md object-cover"
              />
              <div className="mt-1 text-xs text-gray-700 truncate">
                {a.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
