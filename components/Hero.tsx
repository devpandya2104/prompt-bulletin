"use client";
import { useState } from "react";
import type { HeroConfig } from "@/lib/site-config";
import { DEFAULT_HERO } from "@/lib/site-config";

export default function Hero({ config = DEFAULT_HERO }: { config?: HeroConfig }) {
  const [query,     setQuery]     = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section className="pt-36 pb-24 text-center relative overflow-hidden">
      <div className="absolute pointer-events-none" style={{ top: -80, left: "50%", transform: "translateX(-50%)", width: 800, height: 500, background: "radial-gradient(ellipse at center, oklch(72% 0.19 52 / 0.08) 0%, transparent 70%)" }} />
      <div className="absolute pointer-events-none" style={{ top: 100, left: "20%", width: 300, height: 300, background: "radial-gradient(ellipse at center, oklch(72% 0.19 198 / 0.05) 0%, transparent 70%)" }} />

      <div className="max-w-3xl mx-auto px-6 relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7" style={{ border: "1px solid var(--border2)", background: "rgba(255,255,255,0.04)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span className="text-[13px] font-medium" style={{ color: "var(--text2)" }}>{config.badge}</span>
        </div>

        {/* Headline */}
        <h1 className="font-bold leading-[1.08] tracking-tighter mb-5"
          style={{ fontFamily: "var(--font-space)", fontSize: "clamp(40px,7vw,64px)", color: "var(--text)" }}>
          {config.headline1}<br />
          <span style={{ color: "var(--accent)" }}>{config.headline2}</span>
        </h1>

        <p className="text-lg leading-relaxed mb-10 mx-auto max-w-lg" style={{ color: "var(--text2)" }}>
          {config.subheading}
        </p>

        {/* Search bar */}
        <div className="flex items-center gap-3 max-w-xl mx-auto mb-12 rounded-2xl px-4 py-1.5 transition-all duration-200"
          style={{ background: "var(--bg3)", border: `1px solid ${isFocused ? "var(--accent)" : "var(--border2)"}`, boxShadow: isFocused ? "0 0 0 3px oklch(72% 0.19 52 / 0.12)" : "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
            placeholder={config.searchPlaceholder}
            className="flex-1 bg-transparent border-0 outline-none text-[15px] py-2.5"
            style={{ color: "var(--text)", fontFamily: "var(--font-inter)" }} />
          <button className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-opacity hover:opacity-85"
            style={{ background: "var(--accent)", color: "#000", border: "none" }}>
            Search
          </button>
        </div>

        {/* Quick filters */}
        <div className="flex gap-2.5 justify-center flex-wrap mb-14">
          {config.quickFilters.map((tag) => (
            <button key={tag}
              className="px-4 py-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-all duration-150"
              style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--text2)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "var(--border2)"; }}>
              {tag}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center flex-wrap">
          {config.stats.map((stat, i) => (
            <div key={stat.label} className="px-8 text-center"
              style={{ borderRight: i < config.stats.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>{stat.value}</div>
              <div className="text-[13px] mt-0.5" style={{ color: "var(--text3)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
