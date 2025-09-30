import React from "react";
import useMenu from "../hooks/useMenu";
import MenuList from "../Components/menu/MenuList";
import MenuEditor from "../Components/menu/MenuEditor";
import AssetsPanel from "../Components/menu/AssetsPanel";

export default function MenuManagement() {
  const M = useMenu();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-xl font-semibold text-gray-900">Menu Management</h1>
        <p className="text-sm text-gray-500">
          Manage menu items, descriptions, pricing, and visual assets.
        </p>
      </div>

      {/* CONTENT GRID */}
      <div
        className="
          grid items-start
          grid-cols-1 md:grid-cols-12
          gap-4 sm:gap-5
        "
      >
        {/* Left list (sticky on lg+, scroll inside) */}
        <div className="md:col-span-4 lg:col-span-4">
          <div
            className="
              lg:sticky lg:top-20
              lg:max-h-[calc(100vh-140px)]
            "
          >
            <MenuList
              items={M.filtered}
              query={M.query}
              setQuery={M.setQuery}
              selectedId={M.selectedId}
              onSelect={M.setSelectedId}
              onAdd={M.create}
            />
          </div>
        </div>

        {/* Right column: editor + assets */}
        <div className="md:col-span-8 lg:col-span-8 space-y-4 sm:space-y-5">
          {/* Ensure panels line up + stretch nicely */}
          <div className="min-h-[340px]">
            <MenuEditor item={M.selected} onSave={M.save} onDelete={M.remove} />
          </div>

          <AssetsPanel assets={M.assets} onUpload={M.upsertAsset} />
        </div>
      </div>
    </div>
  );
}
