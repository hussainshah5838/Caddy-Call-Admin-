import React, { useMemo, useRef, useState } from "react";
import { MdPhotoCamera, MdWarning } from "react-icons/md";
import Card from "../Components/account/Card";
import Field from "../Components/account/Field";
import Input from "../Components/account/Input";
import Select from "../Components/account/Select";
import Toggle from "../Components/account/Toggle";
import ConfirmModal from "../Components/account/ConfirmModal";

/* ---------- mock data (replace with API data) ---------- */
const mockUser = {
  id: "admin-1",
  name: "Avery Admin",
  email: "admin@golflink.example",
  phone: "+1 (555) 010-9988",
  avatar: "/me.jpg",
  org: "GolfLink",
  role: "Super Admin",
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
export default function AccountPage() {
  const [user, setUser] = useState(mockUser);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || `https://i.pravatar.cc/128?u=${user.email}`);
  const [showDanger, setShowDanger] = useState(false);
  const fileRef = useRef(null);

  const pwdValid = useMemo(
    () =>
      pwd.next.length >= 8 && /[A-Z]/.test(pwd.next) && /[a-z]/.test(pwd.next) &&
      /[0-9]/.test(pwd.next) && pwd.next === pwd.confirm,
    [pwd]
  );

  /* ---- handlers (wire to API) ---- */
  const onSaveProfile = () => {
    console.log("Save profile", { name: user.name, email: user.email, phone: user.phone, avatarUrl });
  };
  const onSavePrefs = () => {
    console.log("Save prefs", {
      timezone: user.timezone, locale: user.locale, theme: user.theme,
      notifyEmail: user.notifyEmail, notifyPush: user.notifyPush,
    });
  };
  const onChangePassword = () => {
    console.log("Change password", pwd);
    setPwd({ current: "", next: "", confirm: "" });
  };
  const onToggle2FA = (v) => setUser((u) => ({ ...u, twoFactor: v }));
  const onDeleteAccount = () => console.log("Delete account requested");

  const pickFile = () => fileRef.current?.click();
  const onAvatarFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (avatarUrl.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    setAvatarUrl(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Account</h1>
        <p className="text-sm text-gray-500">Manage your admin profile, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* PROFILE */}
        <div className="lg:col-span-7 space-y-4">
          <Card title="Profile" subtitle="Your basic information and contact details.">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full object-cover border border-gray-200"
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
                  <Input value={user.name} onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))} />
                </Field>
                <Field label="Email">
                  <Input type="email" value={user.email} onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))} />
                </Field>
                <Field label="Phone">
                  <Input value={user.phone} onChange={(e) => setUser((u) => ({ ...u, phone: e.target.value }))} />
                </Field>
                <Field label="Organization">
                  <Input value={user.org} disabled />
                </Field>
                <Field label="Role">
                  <Input value={user.role} disabled />
                </Field>
              </div>
            </div>

            <div className="mt-4">
              <button onClick={onSaveProfile} className="rounded-md bg-emerald-700 text-white px-4 py-2 text-sm hover:bg-emerald-800">
                Save Profile
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
              <Toggle checked={user.twoFactor} onChange={onToggle2FA} label="Enable Two-Factor Authentication" />
              <button
                onClick={onChangePassword}
                disabled={!pwdValid || !pwd.current}
                className={`rounded-md px-4 py-2 text-sm text-white ${pwdValid && pwd.current ? "bg-emerald-700 hover:bg-emerald-800" : "bg-gray-300 cursor-not-allowed"}`}
              >
                Change Password
              </button>
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
              <div className="flex flex-col justify-center gap-3">
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
