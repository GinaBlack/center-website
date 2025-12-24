import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase_config";

const AvatarPlaceholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlMGUwZTAiLz48cGF0aCBkPSJNNTAgMzVjLTguMjgzIDAtMTUgNi43MTctMTUgMTVzNi43MTcgMTUgMTUgMTUgMTUtNi43MTcgMTUtMTUtNi43MTctMTUtMTUtMTV6bTAgNDBjLTEzLjgwNyAwLTI1IDExLjE5My0yNSAyNWg1MGMwLTEzLjgwNy0xMS4xOTMtMjUtMjUtMjV6IiBmaWxsPSIjYWFhIi8+PC9zdmc+";

import {
  Edit,
  Save,
  Lock,
  Shield,
  Trash2,
  Mail,
  CheckCircle
} from "lucide-react";

/* ================= TYPES ================= */

interface UserProfile {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
}

/* ================= COMPONENT ================= */

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile>({
    first_name: "",
    last_name: "",
    phone: "",
    address: ""
  });

  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ================= FETCH PROFILE ================= */

  useEffect(() => {
    if (!currentUser) return;

    const loadProfile = async () => {
      try {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const loaded = {
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone: data.phone || "",
            address: data.address || ""
          };

          setProfile(loaded);
          setOriginalProfile(loaded);
        }
      } catch {
        setError("Failed to load profile information.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  /* ================= VALIDATION ================= */

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (profile.first_name.trim().length < 2 || profile.first_name.length > 20) {
      errors.push("First name must be between 2 and 20 characters.");
    }

    if (profile.last_name.trim().length < 2 || profile.last_name.length > 20) {
      errors.push("Last name must be between 2 and 20 characters.");
    }

    if (profile.phone && !/^[0-9+\s]{9,20}$/.test(profile.phone)) {
      errors.push("Phone number format is invalid.");
    }

    return errors;
  }, [profile]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(profile) !== JSON.stringify(originalProfile);
  }, [profile, originalProfile]);

  /* ================= UNSAVED CHANGES WARNING ================= */

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (editing && hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [editing, hasChanges]);

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!currentUser || validationErrors.length > 0) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          ...profile,
          updated_at: new Date()
        },
        { merge: true }
      );

      setOriginalProfile(profile);
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch {
      setError("Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-3xl mx-auto bg-white border rounded-xl p-6 space-y-10">

        {/* HEADER */}
        <div className="flex items-center gap-6">
          <img
            src={AvatarPlaceholder}
            alt="Avatar"
            className="w-25 h-25 rounded-full border object-cover"
          />
          

          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {profile.first_name || "—"} {profile.last_name || ""}
            </h1>
            <p className="text-gray-500">
              Manage your profile and account settings
            </p>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg"
          >
            <Edit size={16} />
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* PROFILE DETAILS */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Profile Details</h2>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <Mail size={14} /> Email
            </label>
            <input
              value={currentUser?.email || ""}
              placeholder="your@email.com"
              disabled
              className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">First Name</label>
            <input
              value={profile.first_name}
              placeholder="Enter your first name"
              disabled={!editing}
              onChange={(e) =>
                setProfile({ ...profile, first_name: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Last Name</label>
            <input
              value={profile.last_name}
              placeholder="Enter your last name"
              disabled={!editing}
              onChange={(e) =>
                setProfile({ ...profile, last_name: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Phone Number</label>
            <input
              value={profile.phone}
              placeholder="e.g. +237 6XX XXX XXX"
              disabled={!editing}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Address</label>
            <input
              value={profile.address}
              placeholder="Enter your address (optional)"
              disabled={!editing}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
            />
          </div>

          {validationErrors.length > 0 && (
            <div className="text-red-500 text-sm space-y-1">
              {validationErrors.map((e, i) => (
                <p key={i}>• {e}</p>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && (
            <p className="text-green-500 text-sm flex items-center gap-2">
              <CheckCircle size={14} /> {success}
            </p>
          )}

          {editing && (
            <button
              onClick={handleSave}
              disabled={!hasChanges || validationErrors.length > 0 || saving}
              className="mt-4 flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          )}
        </section>

        {/* ACCOUNT SETTINGS */}
        <div className="space-y-4  pt-8">
        <section className="space-y-4 border-t pt-4">
          <h2 className="text-lg font-semibold">Account Settings</h2>

          <button
            onClick={() => navigate("/dashboard/change-password")}
            className="w-full flex items-center gap-3 px-4 py-3 border rounded-lg"
          >
            <Lock size={18} />
            Change Password
          </button>

          <button
            onClick={() => navigate("/dashboard/settings")}
            className="w-full flex items-center gap-3 px-4 py-3 border rounded-lg"
          >
            <Shield size={18} />
            Privacy Settings
          </button>

          <button
            disabled
            className="w-full flex items-center gap-3 px-4 py-3 border rounded-lg text-red-600 opacity-60"
          >
            <Trash2 size={18} />
            Delete Account (Coming Soon)
          </button>
        </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
