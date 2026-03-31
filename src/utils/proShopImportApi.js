const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * @param {File} file
 * @param {string} [courseId] - Super Admin / admin: current course ObjectId from route. Omit for course admin.
 */
export async function postProShopImport(file, courseId) {
  const token = localStorage.getItem("auth:token");
  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const formData = new FormData();
  formData.append("file", file);
  if (courseId != null && String(courseId).trim() !== "") {
    formData.append("course", String(courseId).trim());
  }

  const response = await fetch(`${API_BASE_URL}/proshop/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.success !== true) {
    throw new Error(data?.message || "Import failed.");
  }

  return data;
}
