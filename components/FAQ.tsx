"use client";
import { useState } from "react";
import { FAQS } from "@/lib/data";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-6" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>FAQ</p>
          <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
            Frequently asked questions
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-5 py-4 bg-transparent border-0 flex items-center justify-between gap-4 cursor-pointer text-left"
              >
                <span className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
                  {faq.q}
                </span>
                <div style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </button>
              {open === i && (
                <div className="px-5 pb-5" style={{ borderTop: "1px solid var(--border)" }}>
                  <p className="text-sm leading-relaxed mt-4" style={{ color: "var(--text2)" }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
