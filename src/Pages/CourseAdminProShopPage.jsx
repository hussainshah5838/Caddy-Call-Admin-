import React from "react";
import { MdOutlineUploadFile } from "react-icons/md";
import useCourseAdminProShop from "../hooks/useCourseAdminProShop";
import CourseAdminProShopList from "../Components/proshop/CourseAdminProShopList";
import CourseAdminProShopEditor from "../Components/proshop/CourseAdminProShopEditor";
import CourseAdminProShopAssetsPanel from "../Components/proshop/CourseAdminProShopAssetsPanel";
import UploadProShopFileModal from "../Components/proshop/UploadProShopFileModal";
import MenuCsvImportResultModal from "../Components/menu/MenuCsvImportResultModal";

export default function CourseAdminProShopPage() {
  const P = useCourseAdminProShop();
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [importResultOpen, setImportResultOpen] = React.useState(false);
  const [importResult, setImportResult] = React.useState(null);

  return (
    <div className="space-y-5">
      <div className="px-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-gray-900">Pro Shop</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your pro shop items, descriptions, pricing, and visual assets.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 sm:w-auto"
          >
            <MdOutlineUploadFile className="h-5 w-5 text-gray-600" />
            Upload Pro Shop (CSV / Excel)
          </button>
        </div>
      </div>

      <UploadProShopFileModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onImported={P.reload}
        onImportFinished={(payload) => {
          setImportResult(payload);
          setImportResultOpen(true);
        }}
      />
      <MenuCsvImportResultModal
        open={importResultOpen}
        onClose={() => {
          setImportResultOpen(false);
          setImportResult(null);
        }}
        created={importResult?.created ?? 0}
        failed={importResult?.failed ?? 0}
        errors={importResult?.errors ?? []}
      />

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
