"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

type Mode = "login" | "signup" | "reset";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode,     setMode]     = useState<Mode>("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const switchMode = (m: Mode) => { setMode(m); setError(""); setSuccess(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const supabase = createClient();

    if (mode === "reset") {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE_URL}/reset-password`,
      });
      if (err) setError(err.message);
      else setSuccess("Reset link sent! Check your inbox.");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(err.message);
      else setSuccess("Check your email to confirm your account!");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError("Invalid email or password.");
      else { onClose(); }
    }
    setLoading(false);
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    background: "rgba(255,255,255,0.06)", border: "1px solid var(--border2)",
    color: "var(--text)", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none",
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-7 relative"
        style={{ background: "var(--bg2)", border: "1px solid var(--border2)" }}
        onClick={(e) => e.stopPropagation()}>

        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
          style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "var(--text3)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="var(--accent)"/>
            <path d="M19 14L19.9 16.1L22 17L19.9 17.9L19 20L18.1 17.9L16 17L18.1 16.1L19 14Z" fill="var(--accent)" opacity="0.5"/>
            <path d="M5 3L5.7 4.8L7.5 5.5L5.7 6.2L5 8L4.3 6.2L2.5 5.5L4.3 4.8L5 3Z" fill="var(--accent)" opacity="0.5"/>
          </svg>
          <span className="font-bold" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>PromptBulletin</span>
        </div>

        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
          {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text2)" }}>
          {mode === "login"  ? "Sign in to upvote tools and save favorites."
           : mode === "signup" ? "Join 48K+ professionals discovering AI tools."
           : "Enter your email and we'll send a reset link."}
        </p>

        {success ? (
          <div className="text-center py-4">
            <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>{success}</p>
            <button onClick={onClose} className="mt-4 text-sm" style={{ color: "var(--text2)", background: "none", border: "none", cursor: "pointer" }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com" required style={inp}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--border2)")} />
            {mode !== "reset" && (
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" required minLength={6} style={inp}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--border2)")} />
            )}
            {error && <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>}
            <button type="submit" disabled={loading}
              className="py-3 rounded-xl font-bold text-sm cursor-pointer transition-opacity mt-1"
              style={{ background: "var(--accent)", border: "none", color: "#000", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </button>
          </form>
        )}

        <div className="text-sm text-center mt-5 flex flex-col gap-2" style={{ color: "var(--text3)" }}>
          {mode === "login" && (
            <>
              <span>
                {"Don't have an account? "}
                <button onClick={() => switchMode("signup")} className="font-medium cursor-pointer bg-transparent border-0 p-0" style={{ color: "var(--accent)" }}>Sign up free</button>
              </span>
              <button onClick={() => switchMode("reset")} className="cursor-pointer bg-transparent border-0 p-0 text-sm" style={{ color: "var(--text3)" }}>
                Forgot password?
              </button>
            </>
          )}
          {mode === "signup" && (
            <span>
              {"Already have an account? "}
              <button onClick={() => switchMode("login")} className="font-medium cursor-pointer bg-transparent border-0 p-0" style={{ color: "var(--accent)" }}>Sign in</button>
            </span>
          )}
          {mode === "reset" && (
            <button onClick={() => switchMode("login")} className="cursor-pointer bg-transparent border-0 p-0 text-sm" style={{ color: "var(--accent)" }}>
              ← Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
