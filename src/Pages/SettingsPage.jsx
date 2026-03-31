import React from "react";
import { MdSearch } from "react-icons/md";
import SettingRow from "../Components/settings/SettingRow";
import { settingsItems } from "../Data/settings";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function SettingsPage() {
  const [openId, setOpenId] = React.useState(null);
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  const privacyItem = settingsItems.find((s) => s.id === "privacy");
  const helpItem = settingsItems.find((s) => s.id === "help");

  const [courses, setCourses] = React.useState([]);
  const [coursesLoading, setCoursesLoading] = React.useState(true);
  const [coursesError, setCoursesError] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");

  const [selectedId, setSelectedId] = React.useState("");
  const [policyText, setPolicyText] = React.useState("");
  const [policyLoading, setPolicyLoading] = React.useState(false);
  const [policySaving, setPolicySaving] = React.useState(false);
  const [policyError, setPolicyError] = React.useState("");
  const [policySaveMessage, setPolicySaveMessage] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    const loadCourses = async () => {
      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (mounted) {
          setCoursesError("Authentication token not found.");
          setCoursesLoading(false);
        }
        return;
      }

      setCoursesLoading(true);
      setCoursesError("");
      try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !Array.isArray(data?.courses)) {
          throw new Error(data?.message || "Failed to load courses.");
        }
        const rows = data.courses
          .map((c) => ({
            id: String(c?._id || ""),
            name: String(c?.courseName || "").trim() || "Untitled course",
          }))
          .filter((c) => c.id)
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        if (mounted) setCourses(rows);
      } catch (e) {
        if (mounted) {
          setCoursesError(e?.message || "Failed to load courses.");
          setCourses([]);
        }
      } finally {
        if (mounted) setCoursesLoading(false);
      }
    };

    loadCourses();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredCourses = React.useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => c.name.toLowerCase().includes(q));
  }, [courses, searchInput]);

  const loadPolicyForCourse = React.useCallback(async (courseId) => {
    const token = localStorage.getItem("auth:token");
    if (!token || !courseId) return;

    setPolicyLoading(true);
    setPolicyError("");
    setPolicySaveMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success || !data?.course) {
        throw new Error(data?.message || "Failed to load course.");
      }
      setPolicyText(String(data.course.coursePolicy ?? ""));
    } catch (e) {
      setPolicyError(e?.message || "Failed to load course policy.");
      setPolicyText("");
    } finally {
      setPolicyLoading(false);
    }
  }, []);

  const selectCourse = (courseId) => {
    if (courseId === selectedId) return;
    setSelectedId(courseId);
    setPolicyText("");
    loadPolicyForCourse(courseId);
  };

  const savePolicy = async () => {
    const token = localStorage.getItem("auth:token");
    if (!token) {
      setPolicyError("Authentication token not found.");
      return;
    }
    if (!selectedId) return;

    setPolicySaving(true);
    setPolicyError("");
    setPolicySaveMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${selectedId}`, {
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
            {coursesLoading ? (
              <p className="text-sm text-gray-600">Loading courses…</p>
            ) : coursesError && courses.length === 0 ? (
              <p className="text-sm text-red-600">{coursesError}</p>
            ) : (
              <div className="space-y-3">
                {coursesError ? (
                  <p className="text-sm text-amber-700">{coursesError}</p>
                ) : null}

                <label className="block text-xs font-medium text-gray-600">
                  Find a course
                </label>
                <div className="relative">
                  <MdSearch
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden
                  />
                  <input
                    type="search"
                    autoComplete="off"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Search by course name…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="max-h-48 overflow-y-auto py-1">
                    {filteredCourses.length === 0 ? (
                      <p className="px-3 py-4 text-center text-sm text-gray-500">
                        {courses.length === 0
                          ? "No courses available."
                          : "No courses match your search."}
                      </p>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {filteredCourses.map((c) => {
                          const active = selectedId === c.id;
                          return (
                            <li key={c.id}>
                              <button
                                type="button"
                                onClick={() => selectCourse(c.id)}
                                className={`flex w-full items-center px-3 py-2.5 text-left text-sm transition
                                  ${
                                    active
                                      ? "bg-emerald-50 font-medium text-emerald-900"
                                      : "text-gray-800 hover:bg-gray-50"
                                  }`}
                              >
                                {c.name}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                {policyLoading ? (
                  <p className="text-sm text-gray-600">Loading policy…</p>
                ) : selectedId ? (
                  <>
                    {policyError ? (
                      <p className="text-sm text-red-600">{policyError}</p>
                    ) : null}
                    {policySaveMessage ? (
                      <p className="text-sm text-emerald-700">{policySaveMessage}</p>
                    ) : null}
                    <textarea
                      className="w-full min-h-[160px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={policyText}
                      onChange={(e) => {
                        setPolicyText(e.target.value);
                        setPolicySaveMessage("");
                      }}
                      placeholder="Course policy text…"
                      disabled={policySaving}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={savePolicy}
                        disabled={policySaving}
                        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        {policySaving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    Select a course above to view or edit its policy.
                  </p>
                )}
              </div>
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
