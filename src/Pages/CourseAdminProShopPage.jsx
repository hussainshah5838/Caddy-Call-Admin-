import React from "react";
import useCourseAdminProShop from "../hooks/useCourseAdminProShop";
import CourseAdminProShopList from "../Components/proshop/CourseAdminProShopList";
import CourseAdminProShopEditor from "../Components/proshop/CourseAdminProShopEditor";
import CourseAdminProShopAssetsPanel from "../Components/proshop/CourseAdminProShopAssetsPanel";

export default function CourseAdminProShopPage() {
  const P = useCourseAdminProShop();

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h1 className="text-xl font-semibold text-gray-900">Pro Shop</h1>
        <p className="text-sm text-gray-500">
          Manage your pro shop items, descriptions, pricing, and visual assets.
        </p>
      </div>

      {P.error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {P.error}
        </div>
      )}

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
            <CourseAdminProShopList
              items={P.filtered}
              loading={P.loading}
              query={P.query}
              setQuery={P.setQuery}
              selectedId={P.selectedId}
              onSelect={P.setSelectedId}
              onAdd={P.create}
            />
          </div>
        </div>

        <div className="md:col-span-8 lg:col-span-8 space-y-4 sm:space-y-5">
          <div className="min-h-[340px]">
            <CourseAdminProShopEditor
              item={P.selected}
              onSave={P.save}
              onDelete={P.remove}
              isSaving={P.saving}
              isDeleting={P.deleting}
            />
          </div>

          <CourseAdminProShopAssetsPanel
            assets={P.assets}
            onUpload={P.upsertAsset}
          />
        </div>
      </div>
    </div>
  );
}
