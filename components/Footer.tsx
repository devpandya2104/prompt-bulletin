"use client";
import type { FooterConfig } from "@/lib/site-config";
import { DEFAULT_FOOTER } from "@/lib/site-config";

export default function Footer({ config = DEFAULT_FOOTER }: { config?: FooterConfig }) {
  return (
    <footer className="px-6 pt-12 pb-8" style={{ borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-black text-[13px]"
                style={{ background: "var(--accent)", fontFamily: "var(--font-space)" }}>P</div>
              <span className="font-bold text-base" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>PromptBulletin</span>
            </div>
            <p className="text-[13.5px] leading-[1.7] max-w-[280px]" style={{ color: "var(--text3)" }}>
              {config.description}
            </p>
          </div>

          {/* Link columns */}
          {config.columns.map((col) => (
            <div key={col.title}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text2)" }}>{col.title}</div>
              <div className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <a key={l.label} href={l.href}
                    className="text-[13.5px] no-underline transition-colors duration-150"
                    style={{ color: "var(--text3)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-[13px]" style={{ color: "var(--text3)" }}>{config.copyright}</span>
          <div className="flex gap-5">
            {config.legalLinks.map((l) => (
              <a key={l.label} href={l.href}
                className="text-[13px] no-underline transition-colors duration-150"
                style={{ color: "var(--text3)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
