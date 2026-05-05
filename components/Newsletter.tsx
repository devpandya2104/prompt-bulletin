"use client";
import { useState } from "react";
import { subscribeToNewsletter } from "@/app/admin/actions";
import type { NewsletterConfig } from "@/lib/site-config";
import { DEFAULT_NEWSLETTER } from "@/lib/site-config";

export default function Newsletter({ config = DEFAULT_NEWSLETTER }: { config?: NewsletterConfig }) {
  const [email,   setEmail]   = useState("");
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubscribe = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      await subscribeToNewsletter(email);
      setDone(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setError(msg === "already_subscribed" ? "You're already subscribed!" : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 text-center" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <h2 className="text-[28px] font-bold tracking-tight mb-2.5" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
          {config.heading}
        </h2>
        <p className="text-[15px] mb-7" style={{ color: "var(--text2)" }}>
          {config.subheading}
        </p>
        {done ? (
          <p className="text-[15px] font-semibold" style={{ color: "var(--accent)" }}>You&apos;re in! Check your inbox to confirm. ✓</p>
        ) : (
          <>
            <div className="flex gap-2.5 max-w-sm mx-auto">
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder={config.placeholder} type="email"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text)", fontFamily: "var(--font-inter)", outline: "none" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--border2)")} />
              <button onClick={handleSubscribe} disabled={!email || loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-opacity hover:opacity-85 whitespace-nowrap"
                style={{ background: "var(--accent)", color: "#000", border: "none", opacity: email && !loading ? 1 : 0.7 }}>
                {loading ? "…" : "Subscribe"}
              </button>
            </div>
            {error && <p className="text-xs mt-2" style={{ color: error.includes("already") ? "var(--accent)" : "#ef4444" }}>{error}</p>}
          </>
        )}
      </div>
    </section>
  );
}
