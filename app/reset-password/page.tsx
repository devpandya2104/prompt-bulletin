"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);

  const inp: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    background: "rgba(255,255,255,0.06)", border: "1px solid var(--border2)",
    color: "var(--text)", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/"), 2500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm rounded-2xl p-7"
        style={{ background: "var(--bg2)", border: "1px solid var(--border2)" }}>

        <div className="flex items-center gap-2.5 mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="var(--accent)"/>
            <path d="M19 14L19.9 16.1L22 17L19.9 17.9L19 20L18.1 17.9L16 17L18.1 16.1L19 14Z" fill="var(--accent)" opacity="0.5"/>
            <path d="M5 3L5.7 4.8L7.5 5.5L5.7 6.2L5 8L4.3 6.2L2.5 5.5L4.3 4.8L5 3Z" fill="var(--accent)" opacity="0.5"/>
          </svg>
          <span className="font-bold" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>PromptBulletin</span>
        </div>

        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
          Set new password
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text2)" }}>
          Choose a strong password for your account.
        </p>

        {success ? (
          <div className="text-center py-4">
            <p className="text-sm font-medium mb-1" style={{ color: "var(--accent)" }}>Password updated!</p>
            <p className="text-xs" style={{ color: "var(--text3)" }}>Redirecting you to the homepage…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="New password" required minLength={6} style={inp}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--border2)")} />
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password" required minLength={6} style={inp}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--border2)")} />
            {error && <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>}
            <button type="submit" disabled={loading}
              className="py-3 rounded-xl font-bold text-sm cursor-pointer transition-opacity mt-1"
              style={{ background: "var(--accent)", border: "none", color: "#000", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
