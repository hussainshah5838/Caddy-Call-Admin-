import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdPhotoCamera, MdWarning } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Card from "../Components/account/Card";
import Field from "../Components/account/Field";
import Input from "../Components/account/Input";
import Select from "../Components/account/Select";
import Toggle from "../Components/account/Toggle";
import ConfirmModal from "../Components/account/ConfirmModal";
import { useAuth } from "../context/AuthContext";
 
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const emptyUser = {
  id: "",
  name: "",
  email: "",
  phone: "",
  avatar: "",
  course: "",
  role: "Course Admin",
  timezone: "America/Los_Angeles",
  locale: "en-US",
  theme: "system", // light | dark | system
  notifyEmail: true,
  notifyPush: true,
  twoFactor: false,
};

const timezones = [
  "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
  "Europe/London", "Europe/Berlin", "Asia/Dubai", "Asia/Kolkata", "Asia/Tokyo",
];
const locales = ["en-US", "en-GB", "de-DE", "fr-FR", "es-ES", "ja-JP"];

/* ---------- page ---------- */
export default function CourseAdminAccountPage() {
  const nav = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(emptyUser);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [showDanger, setShowDanger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef(null);

  const pwdValid = useMemo(
    () =>
      pwd.next.length >= 8 && /[A-Z]/.test(pwd.next) && /[a-z]/.test(pwd.next) &&
      /[0-9]/.test(pwd.next) && pwd.next === pwd.confirm,
    [pwd]
  );
  const passwordHint = useMemo(() => {
    if (!pwd.current) return "Enter current password.";
    if (pwd.confirm && pwd.next !== pwd.confirm) {
      return "Confirm password does not match the new password.";
    }
    const meetsPolicy =
      pwd.next.length >= 8 &&
      /[A-Z]/.test(pwd.next) &&
      /[a-z]/.test(pwd.next) &&
      /[0-9]/.test(pwd.next);
    if (!meetsPolicy) {
      return "Password must be 8+ chars with uppercase, lowercase and number.";
    }
    return "";
  }, [pwd.current, pwd.next, pwd.confirm]);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (isMounted) {
          setError("Authentication token not found.");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !data?.user) {
          throw new Error(data?.message || "Failed to fetch profile.");
        }

        const profile = data.user;
        const roleLabel =
          profile?.role === "course admin"
            ? "Course Admin"
            : profile?.role || "Course Admin";

        if (isMounted) {
          setUser((prev) => ({
            ...prev,
            id: profile?._id || "",
            name: profile?.name || "",
            email: profile?.email || "",
            phone: profile?.phoneNo || "",
            avatar: profile?.photo || "",
            course: profile?.course?.courseName || "",
            role: roleLabel,
          }));
          setAvatarUrl(
            profile?.photo || `https://i.pravatar.cc/128?u=${profile?.email || "course-admin"}`
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to fetch profile.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ---- handlers ---- */
  const onSaveProfile = async () => {
    if (savingProfile) return;
    const token = localStorage.getItem("auth:token");
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    setSavingProfile(true);
    setError("");
    setSuccess("");
    try {
      let photoUrl;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("image", avatarFile);
        const uploadRes = await fetch(`${API_BASE_URL}/upload/image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        });
        const uploadData = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok || !uploadData?.success || !uploadData?.imageUrl) {
          throw new Error(uploadData?.message || "Failed to upload profile image.");
        }
        photoUrl = uploadData.imageUrl;
      }

      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.name,
          phoneNo: user.phone,
          ...(photoUrl !== undefined ? { photo: photoUrl } : {}),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success || !data?.user) {
        throw new Error(data?.message || "Failed to update profile.");
      }

      const updatedUser = data.user;
      setUser((prev) => ({
        ...prev,
        name: updatedUser?.name || prev.name,
        phone: updatedUser?.phoneNo || "",
        avatar: updatedUser?.photo || "",
        course: updatedUser?.course?.courseName || prev.course,
      }));
      setAvatarUrl(
        updatedUser?.photo || `https://i.pravatar.cc/128?u=${updatedUser?.email || user.email}`
      );
      setAvatarFile(null);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const onSavePrefs = () => {
    console.log("Save prefs", {
      timezone: user.timezone, locale: user.locale, theme: user.theme,
      notifyEmail: user.notifyEmail, notifyPush: user.notifyPush,
    });
  };
  const onChangePassword = async () => {
    if (changingPassword) return;
    const token = localStorage.getItem("auth:token");
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    setChangingPassword(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: pwd.current,
          newPassword: pwd.next,
          confirmPassword: pwd.confirm,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to change password.");
      }

      setPwd({ current: "", next: "", confirm: "" });
      setSuccess(data?.message || "Password updated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };
  const onToggle2FA = (v) => setUser((u) => ({ ...u, twoFactor: v }));
  const onDeleteAccount = async () => {
    const token = localStorage.getItem("auth:token");
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete account.");
      }

      logout();
      nav("/auth/login", { replace: true });
    } catch (err) {
      setError(err?.message || "Failed to delete account.");
    }
  };

  const pickFile = () => fileRef.current?.click();
  const onAvatarFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (avatarUrl.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    setAvatarFile(f);
    setAvatarUrl(URL.createObjectURL(f));
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Account</h1>
        <p className="text-sm text-gray-500">Manage your profile, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* PROFILE */}
        <div className="lg:col-span-7 space-y-4">
          <Card title="Profile" subtitle="Your basic information and contact details.">
            {/* Hidden decoy fields prevent Chrome from autofilling profile inputs with login credentials */}
            <div className="hidden" aria-hidden="true">
              <input type="text" name="username" autoComplete="username" tabIndex={-1} />
              <input type="password" name="password" autoComplete="current-password" tabIndex={-1} />
            </div>
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full object-cover border border-gray-200 cursor-pointer"
                  onClick={pickFile}
                  title="Change avatar"
                  onError={(e) => { e.currentTarget.src = `https://i.pravatar.cc/128?u=${user.email}`; }}
                />
                <button
                  onClick={pickFile}
                  className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-emerald-700 text-white shadow"
                  title="Change avatar"
                >
                  <MdPhotoCamera className="h-4 w-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarFile} />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <Input
                    name="course_admin_full_name"
                    autoComplete="off"
                    value={user.name}
                    onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    name="course_admin_email"
                    autoComplete="off"
                    value={user.email}
                    className="bg-gray-100 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    type="tel"
                    name="course_admin_phone"
                    inputMode="tel"
                    autoComplete="off"
                    key={user.id || "course-admin-phone"}
                    value={user.phone}
                    onChange={(e) => setUser((u) => ({ ...u, phone: e.target.value }))}
                  />
                </Field>
                <Field label="Course">
                  <Input
                    value={user.course || "N/A"}
                    className="bg-gray-100 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </Field>
                <Field label="Role">
                  <Input
                    value={(Array.isArray(user.roles) ? user.roles.join(", ") : "") || "N/A"}
                    className="bg-gray-100 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </Field>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={onSaveProfile}
                disabled={savingProfile}
                className={`rounded-md px-4 py-2 text-sm text-white ${
                  savingProfile
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-emerald-700 hover:bg-emerald-800"
                }`}
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </Card>

          <Card title="Security" subtitle="Update your password and secure your account.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Current Password">
                <Input type="password" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} placeholder="••••••••" />
              </Field>
              <Field label="New Password" hint="Min 8 chars with A-Z, a-z, 0-9.">
                <Input type="password" value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} placeholder="New password" />
              </Field>
              <Field label="Confirm New Password">
                <Input type="password" value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" />
              </Field>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="hidden">
                <Toggle checked={user.twoFactor} onChange={onToggle2FA} label="Enable Two-Factor Authentication" />
              </div>
              <div className="text-right">
                <button
                  onClick={onChangePassword}
                  disabled={!pwdValid || !pwd.current || changingPassword}
                  className={`rounded-md px-4 py-2 text-sm text-white ${
                    pwdValid && pwd.current && !changingPassword
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
                {passwordHint && (
                  <p className="mt-1 text-xs text-rose-600">
                    {passwordHint}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* PREFERENCES & DANGER */}
        <div className="lg:col-span-5 space-y-4">
          <Card title="Preferences" subtitle="Time, language, theme, and notifications.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Time Zone">
                <Select value={user.timezone} onChange={(e) => setUser((u) => ({ ...u, timezone: e.target.value }))}>
                  {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </Select>
              </Field>
              <Field label="Locale">
                <Select value={user.locale} onChange={(e) => setUser((u) => ({ ...u, locale: e.target.value }))}>
                  {locales.map((l) => <option key={l} value={l}>{l}</option>)}
                </Select>
              </Field>
              <Field label="Theme">
                <Select value={user.theme} onChange={(e) => setUser((u) => ({ ...u, theme: e.target.value }))}>
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </Field>
              <div className="hidden flex-col justify-center gap-3">
                <Toggle checked={user.notifyEmail} onChange={(v) => setUser((u) => ({ ...u, notifyEmail: v }))} label="Email notifications" />
                <Toggle checked={user.notifyPush} onChange={(v) => setUser((u) => ({ ...u, notifyPush: v }))} label="Push notifications" />
              </div>
            </div>

            <div className="mt-4">
              <button onClick={onSavePrefs} className="rounded-md bg-emerald-700 text-white px-4 py-2 text-sm hover:bg-emerald-800">
                Save Preferences
              </button>
            </div>
          </Card>

          <Card title="Danger Zone" subtitle="These actions are irreversible. Proceed with caution.">
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-rose-600"><MdWarning className="h-5 w-5" /></span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-rose-700">Delete account</div>
                  <div className="text-xs text-rose-600/90">This permanently deletes your admin account.</div>
                </div>
                <button
                  onClick={() => setShowDanger(true)}
                  className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={showDanger}
        title="Delete Account"
        body="This action will permanently delete your admin account and cannot be undone."
        confirmText="Delete account"
        onConfirm={onDeleteAccount}
        onClose={() => setShowDanger(false)}
      />
    </div>
  );
}
