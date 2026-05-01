"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/queries";

const perks = [
  "Free to list — always",
  "Editorial review in 5 business days",
  "Status updates via email",
  "Update your listing at any time",
];

export default function SubmitCTA({ categories }: { categories: Category[] }) {
  const [step,      setStep]      = useState(0);
  const [form,      setForm]      = useState({ name: "", url: "", category_id: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const canStep1 = form.name && form.url && form.category_id;

  const handleSubmit = async () => {
    if (!form.email) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.from("tool_submissions").insert({
      name:            form.name,
      url:             form.url,
      category_id:     form.category_id,
      submitter_email: form.email,
    });
    if (err) {
      setError("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    background: "rgba(255,255,255,0.05)", border: "1px solid var(--border2)",
    color: "var(--text)", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none",
    transition: "border-color 0.2s",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "var(--text2)",
    display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
  };

  return (
    <section id="submit" className="py-20 px-6" style={{ borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Submit your tool</p>
          <h2 className="text-4xl font-bold tracking-tight leading-tight mb-4" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
            Built something great?<br />Get in front of 48K professionals.
          </h2>
          <p className="text-[15px] leading-[1.75] mb-7" style={{ color: "var(--text2)" }}>
            Submit your AI tool and our editors will review it within 5 business days. Listings are free and always will be.
          </p>
          <div className="flex flex-col gap-3">
            {perks.map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span className="text-sm" style={{ color: "var(--text2)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-7" style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}>
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>Submission received!</h3>
              <p className="text-sm" style={{ color: "var(--text2)" }}>
                We&apos;ll review <strong style={{ color: "var(--text)" }}>{form.name}</strong> and email you at <strong style={{ color: "var(--text)" }}>{form.email}</strong> within 5 business days.
              </p>
              <button onClick={() => { setSubmitted(false); setStep(0); setForm({ name: "", url: "", category_id: "", email: "" }); }}
                className="mt-6 px-6 py-2.5 rounded-lg text-sm cursor-pointer"
                style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--text2)" }}>
                Submit another
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-1.5 mb-7">
                {[0, 1].map((s) => (
                  <div key={s} className="flex-1 h-0.5 rounded-full transition-all duration-300"
                    style={{ background: s <= step ? "var(--accent)" : "var(--border2)" }} />
                ))}
              </div>

              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label style={labelStyle}>Tool name *</label>
                    <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Perplexity AI" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                      onBlur={(e)  => (e.target.style.borderColor = "var(--border2)")} />
                  </div>
                  <div>
                    <label style={labelStyle}>Website URL *</label>
                    <input value={form.url} onChange={(e) => update("url", e.target.value)} placeholder="https://your-tool.com" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                      onBlur={(e)  => (e.target.style.borderColor = "var(--border2)")} />
                  </div>
                  <div>
                    <label style={labelStyle}>Category *</label>
                    <select value={form.category_id} onChange={(e) => update("category_id", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="">Select a category…</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <button onClick={() => canStep1 && setStep(1)}
                    className="py-3 rounded-xl font-bold text-sm cursor-pointer transition-opacity mt-1"
                    style={{ background: "var(--accent)", border: "none", color: "#000", opacity: canStep1 ? 1 : 0.4 }}>
                    Continue →
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
                    <div className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{form.name}</div>
                    <div className="text-xs" style={{ color: "var(--text3)" }}>{form.url}</div>
                  </div>
                  <div>
                    <label style={labelStyle}>Your email *</label>
                    <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@company.com" type="email" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                      onBlur={(e)  => (e.target.style.borderColor = "var(--border2)")} />
                  </div>
                  {error && <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>}
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text3)" }}>
                    We&apos;ll use this to send you status updates. We don&apos;t share your email with anyone.
                  </p>
                  <div className="flex gap-2.5">
                    <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl text-sm cursor-pointer"
                      style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--text2)" }}>
                      ← Back
                    </button>
                    <button onClick={handleSubmit} disabled={!form.email || loading}
                      className="flex-[2] py-3 rounded-xl font-bold text-sm cursor-pointer transition-opacity"
                      style={{ background: "var(--accent)", border: "none", color: "#000", opacity: form.email && !loading ? 1 : 0.4 }}>
                      {loading ? "Submitting…" : "Submit tool"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
