import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff, MdMail, MdLock } from "react-icons/md";
import { useAuth } from "../../context/AuthContext.jsx";

const inputBase =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/60";
// Use Vite base URL so assets resolve under subpaths
const BASE = import.meta.env.BASE_URL || "/";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");


    try {
      setLoading(true);
      await login({ email: form.email, password: form.password });
      navigate('/');
    } catch (e) {
      setErr("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = () => {
    // TODO: start your OAuth flow
    console.log("Google OAuth");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-6">
          <img
            src={`${BASE}logo.png`}
            alt="Site logo"
            className="mx-auto h-10 w-10 rounded-full"
          />
          <h1 className="mt-3 text-xl font-semibold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-500">Access your GolfLink Admin account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          {err && (
            <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MdMail />
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set({ email: e.target.value })}
                  placeholder="you@example.com"
                  className={`${inputBase} pl-9`}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MdLock />
                </span>
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set({ password: e.target.value })}
                  placeholder="••••••••"
                  className={`${inputBase} pl-9 pr-10`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            {/* Row: remember + forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => set({ remember: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600"
                />
                Remember me
              </label>

              {/* Swap to your route */}
              <a href="/auth/forgot" className="text-sm text-emerald-700 hover:text-emerald-800">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-md px-4 py-2 text-sm text-white ${
                loading ? "bg-gray-300 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-800"
              }`}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="h-px flex-1 bg-gray-200" />
              or
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
            >
              Continue with Google
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div className="mt-4 text-center text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <a href="/settings#privacy" className="text-emerald-700 hover:text-emerald-800">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
