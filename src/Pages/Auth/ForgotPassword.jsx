import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdMail, MdLock } from "react-icons/md";

const inputBase =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/60";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BASE = import.meta.env.BASE_URL || "/";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  const canResend = useMemo(() => resendSeconds <= 0 && !loading, [resendSeconds, loading]);

  const startResendCooldown = (seconds = 60) => {
    setResendSeconds(seconds);
    const timer = setInterval(() => {
      setResendSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const requestCode = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/forgot-password/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to send verification code.");
      }
      setMessage(data?.message || "Verification code sent.");
      setStep(2);
      startResendCooldown(60);
    } catch (err) {
      setError(err?.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{4}$/.test(code)) {
      setError("Enter a valid 4-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/forgot-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Verification failed.");
      }
      setResetToken(data?.resetToken || "");
      setMessage(data?.message || "Verification successful.");
      setStep(3);
    } catch (err) {
      setError(err?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!canResend) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/forgot-password/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to resend code.");
      }
      setMessage(data?.message || "New verification code sent.");
      startResendCooldown(60);
    } catch (err) {
      setError(err?.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Password reset failed.");
      }
      setMessage(data?.message || "Password reset successful.");
      setTimeout(() => navigate("/auth/login", { replace: true }), 1200);
    } catch (err) {
      setError(err?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img
            src={`${BASE}logo.png`}
            alt="Site logo"
            className="mx-auto h-10 w-10 rounded-full"
          />
          <h1 className="mt-3 text-xl font-semibold text-gray-900">Forgot password</h1>
          <p className="text-sm text-gray-500">
            {step === 1 && "Enter your email to receive a verification code"}
            {step === 2 && "Enter the 4-digit code sent to your email"}
            {step === 3 && "Set your new password"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          {error && (
            <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={requestCode} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MdMail />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`${inputBase} pl-9`}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-md px-4 py-2 text-sm text-white ${
                  loading ? "bg-gray-300 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-800"
                }`}
              >
                {loading ? "Sending..." : "Send verification code"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verifyCode} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputBase}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="1234"
                  className={inputBase}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-md px-4 py-2 text-sm text-white ${
                  loading ? "bg-gray-300 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-800"
                }`}
              >
                {loading ? "Verifying..." : "Verify code"}
              </button>

              <button
                type="button"
                disabled={!canResend}
                onClick={resendCode}
                className={`w-full rounded-md border px-4 py-2 text-sm ${
                  canResend
                    ? "border-gray-200 bg-white hover:bg-gray-50"
                    : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">New password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MdLock />
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={`${inputBase} pl-9`}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Confirm new password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MdLock />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={`${inputBase} pl-9`}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !resetToken}
                className={`w-full rounded-md px-4 py-2 text-sm text-white ${
                  loading || !resetToken
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-emerald-700 hover:bg-emerald-800"
                }`}
              >
                {loading ? "Updating..." : "Reset password"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <Link to="/auth/login" className="text-emerald-700 hover:text-emerald-800">
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
