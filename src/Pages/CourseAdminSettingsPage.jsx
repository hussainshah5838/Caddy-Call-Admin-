import React from "react";
import SettingRow from "../Components/settings/SettingRow";
import { settingsItems } from "../Data/settings";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function CourseAdminSettingsPage() {
  const [openId, setOpenId] = React.useState(null);
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  const privacyItem = settingsItems.find((s) => s.id === "privacy");
  const helpItem = settingsItems.find((s) => s.id === "help");

  const [policyText, setPolicyText] = React.useState("");
  const [policyLoading, setPolicyLoading] = React.useState(true);
  const [courseLoaded, setCourseLoaded] = React.useState(false);
  const [policySaving, setPolicySaving] = React.useState(false);
  const [policyError, setPolicyError] = React.useState("");
  const [policySaveMessage, setPolicySaveMessage] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (mounted) {
          setPolicyError("Authentication token not found.");
          setCourseLoaded(false);
          setPolicyLoading(false);
        }
        return;
      }

      setPolicyLoading(true);
      setPolicyError("");
      try {
        const response = await fetch(`${API_BASE_URL}/courses/my-course`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !data?.course) {
          throw new Error(data?.message || "Failed to load course.");
        }
        if (mounted) {
          setPolicyText(String(data.course.coursePolicy ?? ""));
          setCourseLoaded(true);
        }
      } catch (e) {
        if (mounted) {
          setPolicyError(e?.message || "Failed to load course.");
          setCourseLoaded(false);
        }
      } finally {
        if (mounted) setPolicyLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const savePolicy = async () => {
    const token = localStorage.getItem("auth:token");
    if (!token) {
      setPolicyError("Authentication token not found.");
      return;
    }

    if (!courseLoaded) return;

    setPolicySaving(true);
    setPolicyError("");
    setPolicySaveMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/courses/my-course`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coursePolicy: policyText }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to save course policy.");
      }
      setPolicyText(String(data.course?.coursePolicy ?? policyText));
      setPolicySaveMessage("Saved.");
    } catch (e) {
      setPolicyError(e?.message || "Failed to save course policy.");
    } finally {
      setPolicySaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage all users registered on the Golf Platform, including golfers
          and staff members.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="space-y-3">
          {privacyItem && (
            <SettingRow
              key={privacyItem.id}
              title={privacyItem.title}
              isOpen={openId === privacyItem.id}
              onToggle={() => toggle(privacyItem.id)}
            >
              <pre className="whitespace-pre-wrap">{privacyItem.content.trim()}</pre>
            </SettingRow>
          )}

          <SettingRow
            title="Course policy"
            isOpen={openId === "course-policy"}
            onToggle={() => toggle("course-policy")}
          >
            {policyLoading ? (
              <p className="text-sm text-gray-600">Loading…</p>
            ) : !courseLoaded ? (
              <p className="text-sm text-red-600">{policyError || "Unable to load course."}</p>
            ) : (
              <>
                {policyError ? (
                  <p className="text-sm text-red-600 mb-2">{policyError}</p>
                ) : null}
                {policySaveMessage ? (
                  <p className="text-sm text-emerald-700 mb-2">{policySaveMessage}</p>
                ) : null}
                <textarea
                  className="w-full min-h-[160px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={policyText}
                  onChange={(e) => {
                    setPolicyText(e.target.value);
                    setPolicySaveMessage("");
                  }}
                  placeholder="Enter the policy for your course…"
                  disabled={policySaving}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={savePolicy}
                    disabled={policySaving || policyLoading}
                    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {policySaving ? "Saving…" : "Save"}
                  </button>
                </div>
              </>
            )}
          </SettingRow>

          {helpItem && (
            <SettingRow
              key={helpItem.id}
              title={helpItem.title}
              isOpen={openId === helpItem.id}
              onToggle={() => toggle(helpItem.id)}
            >
              <pre className="whitespace-pre-wrap">{helpItem.content.trim()}</pre>
            </SettingRow>
          )}
        </div>
      </div>
    </div>
  );
}
