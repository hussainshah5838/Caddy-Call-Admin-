const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * @param {File} file
 * @param {string} [courseName] - Super Admin / admin: required course name. Omit for course admin (server uses JWT course).
 * @returns {Promise<{ success: boolean, created: number, failed: number, errors: { row: number, message: string }[] }>}
 */
export async function postMenuCsvImport(file, courseName) {
  const token = localStorage.getItem("auth:token");
  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const formData = new FormData();
  formData.append("file", file);
  if (courseName != null && String(courseName).trim() !== "") {
    formData.append("course", String(courseName).trim());
  }

  const response = await fetch(`${API_BASE_URL}/menu-items/import`, {
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
