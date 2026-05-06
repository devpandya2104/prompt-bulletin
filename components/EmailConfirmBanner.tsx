"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EmailConfirmBanner() {
  const [show, setShow]   = useState(false);
  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.email_confirmed_at) {
        setEmail(user.email ?? "");
        setShow(true);
      } else {
        setShow(false);
      }
    };
    check();
    const { data: { subscription } } = createClient().auth.onAuthStateChange(() => check());
    return () => subscription.unsubscribe();
  }, []);

  const resend = async () => {
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setSent(true);
  };

  if (!show) return null;

  return (
    <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 300, maxWidth: 520, width: "calc(100% - 32px)" }}>
      <div style={{ background: "rgba(20,20,22,0.95)", border: "1px solid oklch(72% 0.19 52 / 0.4)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.78h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text)", fontWeight: 500 }}>Please confirm your email</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            We sent a link to <strong style={{ color: "var(--text2)" }}>{email}</strong>
          </p>
        </div>
        {sent ? (
          <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500, whiteSpace: "nowrap" }}>Sent!</span>
        ) : (
          <button onClick={resend} style={{ padding: "6px 14px", borderRadius: 8, background: "var(--accent)", border: "none", color: "#000", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-inter)" }}>
            Resend
          </button>
        )}
        <button onClick={() => setShow(false)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: 2, lineHeight: 1, fontSize: 18, flexShrink: 0 }}>×</button>
      </div>
    </div>
  );
}
