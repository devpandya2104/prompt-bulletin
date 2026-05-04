"use client";
import { useState } from "react";
import type { Category } from "@/lib/queries";
import type { CategoriesConfig } from "@/lib/site-config";
import { DEFAULT_CATEGORIES } from "@/lib/site-config";

export default function Categories({ categories, config = DEFAULT_CATEGORIES }: {
  categories: Category[];
  config?: CategoriesConfig;
}) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="categories" className="py-20 px-6" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>{config.eyebrow}</p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>{config.heading}</h2>
          </div>
          <a href={config.viewAllHref} className="text-sm font-medium flex items-center gap-1 no-underline whitespace-nowrap" style={{ color: "var(--accent)" }}>
            {config.viewAllLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button key={cat.id}
              onClick={() => setActive(active === cat.slug ? null : cat.slug)}
              className="rounded-xl p-4 text-left transition-all duration-200 flex items-center justify-between cursor-pointer"
              style={{ background: active === cat.slug ? "var(--accent-dim)" : "var(--bg3)", border: `1px solid ${active === cat.slug ? "var(--accent)" : "var(--border)"}` }}
              onMouseEnter={(e) => { if (active !== cat.slug) { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; } }}
              onMouseLeave={(e) => { if (active !== cat.slug) { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.background = "var(--bg3)"; } }}>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="text-xl leading-none">{cat.icon}</div>
                <div className="text-[15px] font-semibold leading-snug break-words"
                  style={{ fontFamily: "var(--font-space)", color: active === cat.slug ? "var(--accent)" : "var(--text)" }}>
                  {cat.name}
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active === cat.slug ? "var(--accent)" : "var(--text3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
