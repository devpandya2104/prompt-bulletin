"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode,     setMode]     = useState<"login" | "signup">("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();

    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); }
      else { setSuccess("Check your email to confirm your account!"); }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError("Invalid email or password."); }
      else { onClose(); }
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
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

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
          style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "var(--text3)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-black text-sm"
            style={{ background: "var(--accent)", fontFamily: "var(--font-space)" }}>P</div>
          <span className="font-bold" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>PromptBulletin</span>
        </div>

        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text2)" }}>
          {mode === "login" ? "Sign in to upvote tools and save favorites." : "Join 48K+ professionals discovering AI tools."}
        </p>

        {success ? (
          <div className="text-center py-4">
            <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>{success}</p>
            <button onClick={onClose} className="mt-4 text-sm" style={{ color: "var(--text2)" }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com" required style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--border2)")} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" required minLength={6} style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--border2)")} />

            {error && <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>}

            <button type="submit" disabled={loading}
              className="py-3 rounded-xl font-bold text-sm cursor-pointer transition-opacity mt-1"
              style={{ background: "var(--accent)", border: "none", color: "#000", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        )}

        <p className="text-sm text-center mt-5" style={{ color: "var(--text3)" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="font-medium cursor-pointer bg-transparent border-0 p-0"
            style={{ color: "var(--accent)" }}>
            {mode === "login" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
