import React, { useEffect, useMemo, useState } from "react";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdStrikethroughS,
  MdLink,
} from "react-icons/md";

const inputBase =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

export default React.memo(function MenuEditor({
  item,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
  emptyStateText = "Select a menu item to edit.",
  editTitlePrefix = "Edit Menu Item",
  deleteButtonLabel = "Delete Menu Item",
  saveButtonLabel = "Save Menu Item",
  categoryOptions = ["Kitchen", "Beverage Cart"],
}) {
  const [form, setForm] = useState(item);

  useEffect(() => setForm(item || null), [item]);

  const requiresCategory = Boolean(form?.isNew);
  const hasCategory = requiresCategory ? Boolean(form?.category) : true;
  const hasKitchenSection =
    String(form?.category || "").toLowerCase() !== "kitchen" ||
    Boolean(form?.menuSection);

  const canSave = useMemo(
    () =>
      !!(
        form &&
        form.name?.trim() &&
        String(form.price ?? "").length > 0 &&
        hasCategory &&
        hasKitchenSection
      ),
    [form, hasCategory, hasKitchenSection]
  );

  const currentCategory = useMemo(
    () => String(form?.category || "").trim(),
    [form?.category]
  );

  const resolvedCategoryOptions = useMemo(() => {
    if (!currentCategory) return categoryOptions;
    const exists = categoryOptions.some((option) => option === currentCategory);
    return exists ? categoryOptions : [currentCategory, ...categoryOptions];
  }, [categoryOptions, currentCategory]);

  if (!form) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 flex items-center justify-center text-gray-500">
        {emptyStateText}
      </div>
    );
  }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const isKitchen = String(form.category || "").toLowerCase() === "kitchen";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="text-sm font-semibold text-gray-900 mb-3">
        {editTitlePrefix}: {form.name}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Item Name */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Item Name</label>
          <input
            className={inputBase}
            value={form.name}
            placeholder="Huevos Rancheros"
            onChange={(e) => set({ name: e.target.value })}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Price</label>
          <input
            className={inputBase}
            type="number"
            step="0.01"
            value={form.price}
            placeholder="12.5"
            onChange={(e) => set({ price: Number(e.target.value) })}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Description
          </label>
          <div className="rounded-md border border-gray-200">
            {/* Faux toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 text-gray-600">
              <button
                type="button"
                className="p-1.5 rounded hover:bg-gray-100"
                title="Bold"
              >
                <MdFormatBold />
              </button>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-gray-100"
                title="Italic"
              >
                <MdFormatItalic />
              </button>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-gray-100"
                title="Underline"
              >
                <MdFormatUnderlined />
              </button>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-gray-100"
                title="Strikethrough"
              >
                <MdStrikethroughS />
              </button>
              <span className="mx-2 h-4 w-px bg-gray-200" />
              <button
                type="button"
                className="p-1.5 rounded hover:bg-gray-100"
                title="Link"
              >
                <MdLink />
              </button>
              <span className="ml-auto text-[11px] text-gray-400">
                Full Editor
              </span>
            </div>
            <textarea
              className="w-full min-h-28 resize-y p-3 text-sm outline-none"
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="Traditional Mexican breakfast with fried eggs, salsa ranchera, and warm tortillas. Served with black beans and avocado."
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Category *</label>
          <select
            className={inputBase}
            value={currentCategory}
            onChange={(e) => {
              const nextCategory = e.target.value;
              set({
                category: nextCategory,
                // Only keep menu section when Kitchen is selected
                menuSection:
                  nextCategory.toLowerCase() === "kitchen"
                    ? form.menuSection || ""
                    : "",
              });
            }}
          >
            <option value="">Select a category</option>
            {resolvedCategoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Menu Section (Kitchen only) */}
        {isKitchen ? (
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Menu Section
            </label>
            <select
              className={inputBase}
              value={form.menuSection || ""}
              onChange={(e) => set({ menuSection: e.target.value })}
            >
              <option value="">Select a section</option>
              <option value="Breakfast Delights">Breakfast Delights</option>
              <option value="Lunch & Dinner">Lunch & Dinner</option>
              <option value="Quick Bites & Snacks">Quick Bites & Snacks</option>
            </select>
          </div>
        ) : null}

        {/* Image URL */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Image URL</label>
          <input
            className={inputBase}
            value={form.image}
            placeholder="https://placehold.co/600x400?text=Huevos+Rancheros"
            onChange={(e) => set({ image: e.target.value })}
          />
        </div>

        {/* Image Alt Text */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Image Alt Text
          </label>
          <input
            className={inputBase}
            value={form.alt}
            placeholder="Plate of Huevos Rancheros with fried eggs, red salsa, and cilantro garnish."
            onChange={(e) => set({ alt: e.target.value })}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Status</label>
          <select
            className={inputBase}
            value={form.status || "draft"}
            onChange={(e) => set({ status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center my-auto gap-3">
        <button
          type="button"
          disabled={isSaving || isDeleting}
          onClick={() => onDelete?.(form.id)}
          className={`text-center my-auto w-full sm:w-auto inline-flex items-center justify-center rounded-md px-4 py-2 text-sm
            ${
              isSaving || isDeleting
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
            }`}
        >
          {isDeleting ? "Deleting..." : deleteButtonLabel}
        </button>

        <button
          type="button"
          disabled={!canSave || isSaving || isDeleting}
          onClick={() => onSave?.(form)}
          className={`text-center my-auto w-full  sm:w-auto inline-flex items-center justify-center rounded-md px-4 py-2 text-sm text-white
            ${
              canSave && !isSaving && !isDeleting
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          {isSaving ? "Saving..." : saveButtonLabel}
        </button>
      </div>
    </div>
  );
});
