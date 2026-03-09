import React from "react";
import useProShop from "../hooks/useProShop";
import MenuList from "../Components/menu/MenuList";
import MenuEditor from "../Components/menu/MenuEditor";
import AssetsPanel from "../Components/menu/AssetsPanel";
import { useNavigate, useParams } from "react-router-dom";

export default function ProShopManagementPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const M = useProShop({ courseId: id });

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h1 className="text-xl font-semibold text-gray-900">
          <button
            className="px-3 py-1.5 rounded border border-gray-200 text-sm"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          Pro Shop
        </h1>
        <p className="text-sm text-gray-500">
          Manage your pro shop items, descriptions, pricing, and visual assets.
        </p>
      </div>

      <div
        className="
          grid items-start
          grid-cols-1 md:grid-cols-12
          gap-4 sm:gap-5
        "
      >
        <div className="md:col-span-4 lg:col-span-4">
          <div
            className="
              lg:sticky lg:top-20
              lg:max-h-[calc(100vh-140px)]
            "
          >
            <MenuList
              items={M.filtered}
              loading={M.loading}
              query={M.query}
              setQuery={M.setQuery}
              selectedId={M.selectedId}
              onSelect={M.setSelectedId}
              onAdd={M.create}
              listTitle="Pro Shop Items"
              searchPlaceholder="Search pro shop items..."
              addButtonLabel="Add New Pro Shop Item"
            />
          </div>
        </div>

        <div className="md:col-span-8 lg:col-span-8 space-y-4 sm:space-y-5">
          <div className="min-h-[340px]">
            <MenuEditor
              item={M.selected}
              onSave={M.save}
              onDelete={M.remove}
              isSaving={M.saving}
              isDeleting={M.deleting}
              emptyStateText="Select a pro shop item to edit."
              editTitlePrefix="Edit Pro Shop Item"
              deleteButtonLabel="Delete Pro Shop Item"
              saveButtonLabel="Save Pro Shop Item"
              categoryOptions={["Cap", "Putter", "Ball", "Shirt"]}
            />
          </div>

          <AssetsPanel assets={M.assets} onUpload={M.upsertAsset} />
        </div>
      </div>
    </div>
  );
}
