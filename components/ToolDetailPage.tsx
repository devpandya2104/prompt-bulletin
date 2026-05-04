"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { submitReview } from "@/lib/queries";
import type { ToolDetail, ToolReview, Tool } from "@/lib/queries";

// ── Icons ────────────────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = "currentColor" }: { name: string; size?: number; color?: string }) {
  const s = { display: "inline-flex", alignItems: "center" as const };
  const icons: Record<string, React.JSX.Element> = {
    arrowLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
    external:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>,
    star:      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    starEmpty: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    arrowUp:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>,
    check:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    minus:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    globe:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    share:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
    bookmark:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
    bookmarkF: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
    chevronR:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
    thumb:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
    zap:       <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  };
  return icons[name] ? <span style={s}>{icons[name]}</span> : null;
}

// ── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Icon key={i} name={i <= Math.round(rating) ? "star" : "starEmpty"} size={size}
          color={i <= Math.round(rating) ? "var(--accent)" : "var(--text3)"} />
      ))}
    </div>
  );
}

// ── Score bar with IntersectionObserver animation ────────────────────────────
function ScoreBar({ label, score }: { label: string; score: number }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimated(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const color = score >= 9 ? "var(--green)" : score >= 7.5 ? "var(--accent)" : "var(--accent2)";
  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 13, color: "var(--text2)", width: 120, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 99 }}>
        <div style={{
          height: "100%", borderRadius: 99, background: color,
          width: animated ? `${(score / 10) * 100}%` : "0%",
          transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 0 8px ${color}88`,
        }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-space)", color: "var(--text)", width: 28, textAlign: "right" }}>{score}</span>
    </div>
  );
}

// ── Section nav ──────────────────────────────────────────────────────────────
function SectionNav() {
  const [active, setActive] = useState("overview");
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "scores",   label: "Scores"   },
    { id: "pricing",  label: "Pricing"  },
    { id: "features", label: "Features" },
    { id: "reviews",  label: "Reviews"  },
  ];
  const scrollTo = (id: string) => {
    setActive(id);
    const el = document.getElementById(`section-${id}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
  };
  return (
    <div style={{ display: "flex" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => scrollTo(t.id)} style={{
          padding: "12px 20px", background: "transparent", border: "none",
          borderBottom: `2px solid ${active === t.id ? "var(--accent)" : "transparent"}`,
          color: active === t.id ? "var(--text)" : "var(--text3)",
          fontFamily: "var(--font-inter)", fontSize: 14, fontWeight: active === t.id ? 600 : 400,
          cursor: "pointer", transition: "all 0.15s", marginBottom: -1,
        }}
        onMouseEnter={e => { if (active !== t.id) (e.currentTarget as HTMLElement).style.color = "var(--text2)"; }}
        onMouseLeave={e => { if (active !== t.id) (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}
        >{t.label}</button>
      ))}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function ToolHero({ tool, upvoted, setUpvoted, upvoteCount, setUpvoteCount, saved, setSaved }:{
  tool: ToolDetail;
  upvoted: boolean; setUpvoted: (v: boolean) => void;
  upvoteCount: number; setUpvoteCount: (fn: (c: number) => number) => void;
  saved: boolean; setSaved: (v: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const handleUpvote = async () => {
    if (loading) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.dispatchEvent(new CustomEvent("open-auth")); return; }
    setLoading(true);
    const will = !upvoted;
    setUpvoted(will);
    setUpvoteCount(c => will ? c + 1 : c - 1);
    if (will) {
      await supabase.from("upvotes").insert({ tool_id: tool.id, user_id: user.id });
      await supabase.rpc("increment_upvote", { tool_id: tool.id });
    } else {
      await supabase.from("upvotes").delete().eq("tool_id", tool.id).eq("user_id", user.id);
      await supabase.rpc("decrement_upvote", { tool_id: tool.id });
    }
    setLoading(false);
  };
  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
  const categoryName = tool.categories?.name ?? tool.tag ?? "Tools";
  return (
    <section style={{ paddingTop: 100, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "30%", width: 700, height: 400, background: "radial-gradient(ellipse, oklch(72% 0.19 52 / 0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 0" }}>
        {/* Back */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text3)", textDecoration: "none", marginBottom: 32 }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text2)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text3)")}>
          <Icon name="arrowLeft" size={14} /> Back to directory
        </Link>

        <div className="tool-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "flex-start" }}>
          {/* Identity */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: "var(--bg3)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 30%, oklch(72% 0.19 52 / 0.18), transparent 70%)" }} />
                <span style={{ fontFamily: "var(--font-space)", fontSize: 28, fontWeight: 700, color: "var(--accent)", position: "relative" }}>{tool.name[0]}</span>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <h1 className="tool-h1" style={{ fontFamily: "var(--font-space)", fontSize: 36, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--text)", lineHeight: 1, margin: 0 }}>{tool.name}</h1>
                  {tool.tag && (
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid oklch(72% 0.19 52 / 0.3)" }}>
                      ✦ {tool.tag}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 16, color: "var(--text2)", margin: 0 }}>{tool.tagline ?? tool.description}</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Stars rating={tool.editor_rating || tool.rating} size={15} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{tool.editor_rating || tool.rating}</span>
                <span style={{ fontSize: 13, color: "var(--text3)" }}>editor · {tool.review_count} reviews</span>
              </div>
              <span style={{ color: "var(--border2)" }}>|</span>
              <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>{categoryName}</span>
              <span style={{ color: "var(--border2)" }}>|</span>
              <span style={{ fontSize: 13, color: "var(--text3)" }}>
                Updated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {tool.platforms.map(p => (
                <span key={p} style={{ fontSize: 12, fontWeight: 500, padding: "4px 11px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text2)" }}>{p}</span>
              ))}
            </div>
          </div>

          {/* Action card */}
          <div className="tool-action-card" style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 18, padding: 24, minWidth: 260, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 4 }}>Starting from</div>
              <div style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>{tool.pricing}</div>
            </div>

            {tool.website_url && (
              <a href={tool.website_url} target="_blank"
                rel={`noopener noreferrer${tool.link_rel === "nofollow" || tool.link_rel === "sponsored" ? ` ${tool.link_rel}` : ""}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 11, background: "var(--accent)", color: "#000", fontWeight: 700, fontSize: 14, textDecoration: "none", transition: "opacity 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                <Icon name="external" size={14} color="#000" />
                Visit {tool.name}
              </a>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleUpvote} disabled={loading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, borderRadius: 10, background: upvoted ? "var(--accent-dim)" : "rgba(255,255,255,0.04)", border: `1px solid ${upvoted ? "var(--accent)" : "var(--border)"}`, color: upvoted ? "var(--accent)" : "var(--text2)", cursor: "pointer", fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 600, transition: "all 0.15s" }}>
                <Icon name="arrowUp" size={14} color={upvoted ? "var(--accent)" : "var(--text2)"} />
                {fmt(upvoteCount)}
              </button>
              <button onClick={() => setSaved(!saved)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, borderRadius: 10, background: saved ? "var(--accent2-dim)" : "rgba(255,255,255,0.04)", border: `1px solid ${saved ? "var(--accent2)" : "var(--border)"}`, color: saved ? "var(--accent2)" : "var(--text2)", cursor: "pointer", fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 600, transition: "all 0.15s" }}>
                <Icon name={saved ? "bookmarkF" : "bookmark"} size={14} color={saved ? "var(--accent2)" : "var(--text2)"} />
                {saved ? "Saved" : "Save"}
              </button>
              <button
                onClick={() => { if (navigator.share) navigator.share({ title: tool.name, url: window.location.href }); else navigator.clipboard.writeText(window.location.href); }}
                style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text2)", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}>
                <Icon name="share" size={15} color="var(--text2)" />
              </button>
            </div>

            <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", lineHeight: 1.5 }}>
              Affiliate disclosure: we may earn a commission on clicks at no cost to you.
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className="section-nav-scroll" style={{ marginTop: 40, borderBottom: "1px solid var(--border)" }}>
          <SectionNav />
        </div>
      </div>
    </section>
  );
}

// ── Overview ─────────────────────────────────────────────────────────────────
function Overview({ tool }: { tool: ToolDetail }) {
  const paras = (tool.summary ?? tool.description).split("\n\n").filter(Boolean);
  return (
    <div id="section-overview">
      <h2 style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 16, letterSpacing: "-0.02em" }}>Overview</h2>
      {paras.map((p, i) => (
        <p key={i} style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.8, marginBottom: 14 }}>{p}</p>
      ))}
      {tool.best_for?.length > 0 && (
        <div style={{ marginTop: 24, padding: 20, background: "var(--bg3)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Best for</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {tool.best_for.map(tag => (
              <span key={tag} style={{ fontSize: 13, fontWeight: 500, padding: "5px 14px", borderRadius: 100, background: "var(--accent-dim)", border: "1px solid oklch(72% 0.19 52 / 0.25)", color: "var(--accent)" }}>{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pros / Cons ───────────────────────────────────────────────────────────────
function ProsCons({ tool }: { tool: ToolDetail }) {
  if (!tool.pros?.length && !tool.cons?.length) return null;
  return (
    <div className="pros-cons-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ background: "var(--green-dim)", border: "1px solid oklch(72% 0.18 145 / 0.25)", borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Pros</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {tool.pros.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <Icon name="check" size={10} color="#000" />
              </div>
              <span style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.5 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "var(--red-dim)", border: "1px solid oklch(65% 0.2 25 / 0.25)", borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Cons</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {tool.cons.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <Icon name="minus" size={10} color="#fff" />
              </div>
              <span style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.5 }}>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Screenshot Gallery ────────────────────────────────────────────────────────
function Gallery({ tool }: { tool: ToolDetail }) {
  const [active, setActive] = useState(0);
  const shots = tool.screenshots?.length
    ? tool.screenshots
    : [{ url: "", caption: "Main interface" }, { url: "", caption: "Key features" }, { url: "", caption: "Settings & config" }, { url: "", caption: "Mobile view" }];
  const cur = shots[active];
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 20, letterSpacing: "-0.02em" }}>Screenshots</h2>
      <div style={{ height: 360, background: "var(--bg3)", borderRadius: 14, border: "1px solid var(--border)", marginBottom: 12, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {cur.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cur.url} alt={cur.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 12px)" }} />
            <div style={{ textAlign: "center", position: "relative" }}>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>[ screenshot {active + 1} of {shots.length} ]</div>
              <div style={{ fontSize: 14, color: "var(--text3)" }}>{cur.caption}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>Add real screenshots via the admin panel</div>
            </div>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {shots.map((shot, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ flex: 1, height: 72, background: "var(--bg3)", borderRadius: 8, border: `1px solid ${active === i ? "var(--accent)" : "var(--border)"}`, cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", position: "relative" }}>
            {shot.url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={shot.url} alt={shot.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 11, color: active === i ? "var(--accent)" : "var(--text3)", fontFamily: "monospace" }}>{i + 1}</span>
            }
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Scores ────────────────────────────────────────────────────────────────────
function Scores({ tool }: { tool: ToolDetail }) {
  if (!tool.scores?.length) return null;
  return (
    <div id="section-scores">
      <h2 style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 24, letterSpacing: "-0.02em" }}>Editorial Scores</h2>
      <div className="scores-grid" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "28px 48px", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 32px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, gap: 8 }}>
          <div style={{ fontFamily: "var(--font-space)", fontSize: 64, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.05em", lineHeight: 1 }}>{tool.editor_rating || tool.rating}</div>
          <Stars rating={tool.editor_rating || tool.rating} size={16} />
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>Editor score</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tool.scores.map(s => <ScoreBar key={s.label} label={s.label} score={s.score} />)}
        </div>
      </div>
    </div>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function Pricing({ tool }: { tool: ToolDetail }) {
  if (!tool.pricing_tiers?.length) return null;
  return (
    <div id="section-pricing">
      <h2 style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 24, letterSpacing: "-0.02em" }}>Pricing</h2>
      <div className="pricing-grid-wrap"><div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${tool.pricing_tiers.length}, 1fr)`, gap: 14 }}>
        {tool.pricing_tiers.map(tier => (
          <div key={tier.name} style={{ background: tier.highlight ? "var(--bg2)" : "var(--bg3)", border: `1px solid ${tier.highlight ? "var(--accent)" : "var(--border)"}`, borderRadius: 16, padding: "24px 22px", position: "relative", overflow: "hidden", boxShadow: tier.highlight ? "0 0 40px oklch(72% 0.19 52 / 0.08)" : "none" }}>
            {tier.highlight && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--accent)" }} />}
            {tier.highlight && (
              <div style={{ position: "absolute", top: 14, right: 14 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: "var(--accent-dim)", color: "var(--accent)" }}>Popular</span>
              </div>
            )}
            <div style={{ fontFamily: "var(--font-space)", fontSize: 15, fontWeight: 700, color: tier.highlight ? "var(--accent)" : "var(--text)", marginBottom: 10 }}>{tier.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--font-space)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--text)" }}>{tier.price}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>{tier.period}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tier.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: tier.highlight ? "var(--accent-dim)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="check" size={9} color={tier.highlight ? "var(--accent)" : "var(--text3)"} />
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
            {tool.website_url && (
              <a href={tool.website_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", marginTop: 22, padding: 10, borderRadius: 9, background: tier.highlight ? "var(--accent)" : "transparent", border: `1px solid ${tier.highlight ? "var(--accent)" : "var(--border2)"}`, color: tier.highlight ? "#000" : "var(--text2)", fontWeight: 600, fontSize: 13, textDecoration: "none", fontFamily: "var(--font-inter)", transition: "all 0.15s" }}
                onMouseEnter={e => { if (!tier.highlight) { (e.currentTarget as HTMLElement).style.color = "var(--text)"; } }}
                onMouseLeave={e => { if (!tier.highlight) { (e.currentTarget as HTMLElement).style.color = "var(--text2)"; } }}>
                Get started
              </a>
            )}
          </div>
        ))}
      </div></div>
    </div>
  );
}

// ── Feature Table ─────────────────────────────────────────────────────────────
function FeatureTable({ tool }: { tool: ToolDetail }) {
  if (!tool.tool_features?.length) return null;
  const tiers = ["Free", "Pro", "Enterprise"];
  return (
    <div id="section-features">
      <h2 style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 20, letterSpacing: "-0.02em" }}>Feature Breakdown</h2>
      <div className="feature-table-outer"><div className="feature-table-inner" style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", background: "var(--bg3)", borderBottom: "1px solid var(--border)", padding: "10px 20px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Feature</span>
          {tiers.map(t => <span key={t} style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>{t}</span>)}
        </div>
        {tool.tool_features.map((f, i) => (
          <div key={f.name} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", padding: "13px 20px", borderBottom: i < tool.tool_features.length - 1 ? "1px solid var(--border)" : "none", background: i % 2 === 0 ? "var(--bg2)" : "transparent" }}>
            <span style={{ fontSize: 14, color: "var(--text2)" }}>{f.name}</span>
            {["", "Pro", "Enterprise"].map((tier, ti) => {
              const has = tier === ""
                ? f.included === true
                : (f.included === true || f.included === tier || (tier === "Enterprise" && f.included !== false));
              return (
                <div key={ti} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {has
                    ? <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--green-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={11} color="var(--green)" /></div>
                    : <span style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600 }}>—</span>
                  }
                </div>
              );
            })}
          </div>
        ))}
      </div></div>
    </div>
  );
}

// ── Reviews ───────────────────────────────────────────────────────────────────
function Reviews({ tool, reviews }: { tool: ToolDetail; reviews: ToolReview[] }) {
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!text || !userRating || !name) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.dispatchEvent(new CustomEvent("open-auth")); setSubmitting(false); return; }
    const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    await submitReview({ tool_id: tool.id, author_name: name, author_initials: initials, role, rating: userRating, date_text: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), review_text: text });
    setSuccess(true); setSubmitting(false); setShowForm(false); setText(""); setName(""); setRole(""); setUserRating(0);
  };

  const avgRating = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : tool.rating;
  const dist = [5,4,3,2,1].map(star => ({ star, pct: reviews.length ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0 }));

  return (
    <div id="section-reviews">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", margin: 0 }}>
          Community Reviews <span style={{ fontSize: 15, fontWeight: 400, color: "var(--text3)", marginLeft: 6 }}>({reviews.length + (success ? 1 : 0)})</span>
        </h2>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "8px 18px", borderRadius: 8, background: "transparent", border: "1px solid var(--border2)", color: "var(--text2)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-inter)" }}>
          {showForm ? "Cancel" : "Write a review"}
        </button>
      </div>

      {/* Rating summary */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 32, marginBottom: 28, padding: "20px 24px", background: "var(--bg2)", borderRadius: 14, border: "1px solid var(--border)", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-space)", fontSize: 52, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
          <Stars rating={avgRating} size={16} />
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>Community avg.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {dist.map(({ star, pct }) => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "var(--text3)", width: 12, textAlign: "right" }}>{star}</span>
              <Icon name="star" size={11} color="var(--accent)" />
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 99 }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: "var(--accent)" }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--text3)", width: 28 }}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write form */}
      {showForm && (
        <div style={{ padding: 22, background: "var(--bg3)", borderRadius: 14, border: "1px solid var(--border2)", marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>Your review</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)", color: "var(--text)", fontSize: 13, fontFamily: "var(--font-inter)", outline: "none" }}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border2)")} />
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="Your role (optional)" style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)", color: "var(--text)", fontSize: 13, fontFamily: "var(--font-inter)", outline: "none" }}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border2)")} />
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setUserRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                <Icon name="star" size={22} color={s <= (hoverRating || userRating) ? "var(--accent)" : "var(--border2)"} />
              </button>
            ))}
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder={`Share your experience with ${tool.name}…`} style={{ width: "100%", height: 100, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 14, fontFamily: "var(--font-inter)", resize: "vertical", outline: "none", lineHeight: 1.6 }}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border2)")} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button onClick={handleSubmit} disabled={submitting} style={{ padding: "9px 22px", borderRadius: 9, background: "var(--accent)", border: "none", color: "#000", fontWeight: 700, fontSize: 13, cursor: text && userRating && name ? "pointer" : "not-allowed", fontFamily: "var(--font-inter)", opacity: text && userRating && name ? 1 : 0.4 }}>
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div style={{ padding: "14px 20px", background: "var(--green-dim)", border: "1px solid oklch(72% 0.18 145 / 0.3)", borderRadius: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 14, color: "var(--green)", fontWeight: 500 }}>Thanks for your review! It will appear after moderation.</span>
        </div>
      )}

      {/* Review cards */}
      {reviews.length === 0 ? (
        <div style={{ padding: "40px 24px", textAlign: "center", background: "var(--bg2)", borderRadius: 14, border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 15, color: "var(--text3)" }}>No reviews yet. Be the first to review {tool.name}!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ padding: "20px 22px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border2)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-dim)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "var(--font-space)", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{r.author_initials}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{r.author_name}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{r.role}{r.role && r.date_text ? " · " : ""}{r.date_text}</div>
                  </div>
                </div>
                <Stars rating={r.rating} size={13} />
              </div>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, marginBottom: 14, marginTop: 0 }}>{r.review_text}</p>
              <button onClick={() => setHelpful(prev => ({ ...prev, [r.id]: !prev[r.id] }))} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: helpful[r.id] ? "var(--accent-dim)" : "rgba(255,255,255,0.04)", border: `1px solid ${helpful[r.id] ? "oklch(72% 0.19 52 / 0.3)" : "var(--border)"}`, color: helpful[r.id] ? "var(--accent)" : "var(--text3)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-inter)", transition: "all 0.15s" }}>
                <Icon name="thumb" size={12} color={helpful[r.id] ? "var(--accent)" : "var(--text3)"} />
                Helpful ({helpful[r.id] ? r.helpful_count + 1 : r.helpful_count})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tool, related }: {
  tool: ToolDetail;
  related: (Pick<Tool, "name" | "slug" | "rating" | "upvote_count" | "pricing"> & { categories: { name: string } | null })[];
}) {
  const [email, setEmail] = useState("");
  const [subbed, setSubbed] = useState(false);
  const handleSubscribe = async () => {
    if (!email) return;
    const supabase = createClient();
    await supabase.from("newsletter_subscribers").insert({ email });
    setSubbed(true);
  };

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Tool info */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Tool info</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Company",  value: tool.company  || "—" },
            { label: "Founded",  value: tool.founded  || "—" },
            { label: "Category", value: tool.categories?.name || "—" },
            { label: "Pricing",  value: tool.pricing },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 13, color: "var(--text3)", flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500, textAlign: "right" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, textAlign: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-dim)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <Icon name="zap" size={16} color="var(--accent)" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-space)", marginBottom: 6 }}>Get weekly AI picks</div>
        <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14, lineHeight: 1.6 }}>New tools & editor reviews every Thursday.</p>
        {subbed ? (
          <p style={{ fontSize: 13, color: "var(--green)", fontWeight: 500 }}>You&apos;re subscribed!</p>
        ) : (
          <>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border2)", color: "var(--text)", fontSize: 13, fontFamily: "var(--font-inter)", outline: "none", marginBottom: 8 }}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border2)")} />
            <button onClick={handleSubscribe} style={{ width: "100%", padding: 9, borderRadius: 8, background: "var(--accent)", border: "none", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-inter)" }}>Subscribe free</button>
          </>
        )}
      </div>

      {/* Related tools */}
      {related.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "var(--font-space)", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 16, letterSpacing: "-0.02em" }}>Related tools</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {related.map(t => (
              <Link key={t.slug} href={`/tools/${t.slug}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, textDecoration: "none", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "var(--bg2)"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "var(--font-space)", fontSize: 13, fontWeight: 700, color: "var(--text3)" }}>{t.name[0]}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{t.categories?.name ?? ""} · {t.pricing}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="star" size={12} color="var(--accent)" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{t.rating}</span>
                  <Icon name="chevronR" size={14} color="var(--text3)" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function ToolDetailPage({ tool, reviews, related }: {
  tool: ToolDetail;
  reviews: ToolReview[];
  related: (Pick<Tool, "name" | "slug" | "rating" | "upvote_count" | "pricing"> & { categories: { name: string } | null })[];
}) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(tool.upvote_count);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("upvotes").select("id").eq("tool_id", tool.id).eq("user_id", user.id).single();
      if (data) setUpvoted(true);
    });
  }, [tool.id]);

  return (
    <div>
      <ToolHero tool={tool} upvoted={upvoted} setUpvoted={setUpvoted} upvoteCount={upvoteCount} setUpvoteCount={setUpvoteCount} saved={saved} setSaved={setSaved} />
      <div className="tool-main-grid" style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 24px 0", display: "grid", gridTemplateColumns: "1fr 340px", gap: 52 }}>
        <main style={{ display: "flex", flexDirection: "column", gap: 52, minWidth: 0 }}>
          <Overview tool={tool} />
          <ProsCons tool={tool} />
          <Gallery tool={tool} />
          <Scores tool={tool} />
          <Pricing tool={tool} />
          <FeatureTable tool={tool} />
          <Reviews tool={tool} reviews={reviews} />
        </main>
        <div className="tool-sidebar-col"><Sidebar tool={tool} related={related} /></div>
      </div>
    </div>
  );
}
