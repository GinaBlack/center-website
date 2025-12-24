import { auth } from "../firebase/firebase_config";

const API_BASE =
  "https://<region>-<project-id>.cloudfunctions.net/api";

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken(true);

  return {
    Authorization: `Bearer ${token}`,
  };
}

/* ===========================
   FILE UPLOAD
=========================== */
export async function uploadFile(formData: FormData) {
  const headers = await getAuthHeaders();

  const res = await fetch(`${API_BASE}/files/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return res.json();
}

/* ===========================
   ADMIN: LIST FILES
=========================== */
export async function listFilesAdmin() {
  const headers = await getAuthHeaders();

  const res = await fetch(`${API_BASE}/files/admin/list`, {
    headers,
  });

  if (!res.ok) {
    throw new Error("Access denied");
  }

  return res.json();
}
