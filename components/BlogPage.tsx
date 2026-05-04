"use client";
import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { BlogPost } from "@/lib/queries";

// ── Category → accent hue ───────────────────────────────────────────────────
const catHue: Record<string, string> = {
  "Deep Dive":  "52",
  "Roundup":    "198",
  "Guide":      "145",
  "News":       "25",
  "Opinion":    "290",
  "General":    "198",
};
const getHue = (cat: string) => catHue[cat] ?? "52";

// ── Icons ────────────────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = "currentColor" }: { name: string; size?: number; color?: string }) {
  const icons: Record<string, React.JSX.Element> = {
    arrowUp:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>,
    search:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    clock:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    zap:         <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    rss:         <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1" fill={color} stroke="none"/></svg>,
    chevronR:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  };
  return icons[name] ? <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name]}</span> : null;
}

// ── Decorative card pattern ──────────────────────────────────────────────────
function CardPattern({ hue }: { hue: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(60deg, oklch(72% 0.19 ${hue} / 0.04) 0px, oklch(72% 0.19 ${hue} / 0.04) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(-60deg, oklch(72% 0.19 ${hue} / 0.04) 0px, oklch(72% 0.19 ${hue} / 0.04) 1px, transparent 1px, transparent 28px)` }} />
      <div style={{ position: "absolute", bottom: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, oklch(72% 0.19 ${hue} / 0.12) 0%, transparent 70%)` }} />
    </div>
  );
}

// ── Featured post card ───────────────────────────────────────────────────────
function FeaturedPost({ post }: { post: BlogPost }) {
  const [upvoted, setUpvoted] = useState(false);
  const [count, setCount] = useState(post.upvote_count);
  const hue = getHue(post.category);
  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
  const dateStr = post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    const will = !upvoted;
    setUpvoted(will);
    setCount(c => will ? c + 1 : c - 1);
    const supabase = createClient();
    await supabase.from("blog_posts").update({ upvote_count: will ? count + 1 : count - 1 }).eq("id", post.id);
  };

  return (
    <Link href={`/blog/${post.slug}`} className="featured-post-wrap" style={{ display: "block", textDecoration: "none", position: "relative", borderRadius: 20, overflow: "hidden", background: "var(--bg2)", border: "1px solid var(--border2)", minHeight: 340, padding: "40px 44px", transition: "border-color 0.2s, transform 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `oklch(72% 0.19 ${hue})`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
      <CardPattern hue={hue} />

      <div className="featured-post-inner" style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "flex-end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: `oklch(72% 0.19 ${hue} / 0.18)`, color: `oklch(72% 0.19 ${hue})`, textTransform: "uppercase", letterSpacing: "0.06em" }}>{post.category}</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "rgba(255,255,255,0.08)", color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>✦ Featured</span>
          </div>
          <h2 className="featured-post-title" style={{ fontFamily: "var(--font-space)", fontSize: 34, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--text)", lineHeight: 1.15, marginBottom: 16, maxWidth: 680 }}>{post.title}</h2>
          <p style={{ fontSize: 16, color: "var(--text2)", lineHeight: 1.7, maxWidth: 600, marginBottom: 28 }}>{post.excerpt}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `oklch(72% 0.19 ${hue} / 0.18)`, border: `1px solid oklch(72% 0.19 ${hue} / 0.4)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: `oklch(72% 0.19 ${hue})`, fontFamily: "var(--font-space)" }}>{post.author_initials}</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{post.author_name}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>{dateStr}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text3)", fontSize: 13 }}>
              <Icon name="clock" size={13} color="var(--text3)" />
              {post.read_time} read
            </div>
          </div>
        </div>

        {/* Upvote */}
        <button onClick={handleUpvote} className="featured-post-upvote" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "14px 16px", borderRadius: 14, background: upvoted ? `oklch(72% 0.19 ${hue} / 0.18)` : "rgba(255,255,255,0.06)", border: `1px solid ${upvoted ? `oklch(72% 0.19 ${hue})` : "rgba(255,255,255,0.15)"}`, cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}>
          <Icon name="arrowUp" size={18} color={upvoted ? `oklch(72% 0.19 ${hue})` : "var(--text2)"} />
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-space)", color: upvoted ? `oklch(72% 0.19 ${hue})` : "var(--text2)" }}>{fmt(count)}</span>
        </button>
      </div>
    </Link>
  );
}

// ── Post card ────────────────────────────────────────────────────────────────
function PostCard({ post, large = false }: { post: BlogPost; large?: boolean }) {
  const [upvoted, setUpvoted] = useState(false);
  const [count, setCount] = useState(post.upvote_count);
  const hue = getHue(post.category);
  const dateStr = post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    const will = !upvoted;
    setUpvoted(will);
    setCount(c => will ? c + 1 : c - 1);
    const supabase = createClient();
    await supabase.from("blog_posts").update({ upvote_count: will ? count + 1 : count - 1 }).eq("id", post.id);
  };

  return (
    <Link href={`/blog/${post.slug}`} style={{ display: "flex", flexDirection: "column", textDecoration: "none", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", transition: "all 0.2s", position: "relative" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>

      {/* Color header */}
      <div style={{ height: large ? 180 : 140, background: "var(--bg3)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <CardPattern hue={hue} />
        {post.cover_image_url && (
          <img src={post.cover_image_url} alt={post.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", top: 14, left: 14, zIndex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: `oklch(72% 0.19 ${hue} / 0.22)`, color: `oklch(72% 0.19 ${hue})`, textTransform: "uppercase", letterSpacing: "0.07em" }}>{post.category}</span>
        </div>
      </div>

      <div style={{ padding: large ? "24px 24px 20px" : "18px 20px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ fontFamily: "var(--font-space)", fontSize: large ? 20 : 16, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.3, marginBottom: 10, flex: 1 }}>{post.title}</h3>
        {large && <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.65, marginBottom: 14 }}>{post.excerpt}</p>}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: `oklch(72% 0.19 ${hue} / 0.15)`, border: `1px solid oklch(72% 0.19 ${hue} / 0.35)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: `oklch(72% 0.19 ${hue})`, fontFamily: "var(--font-space)" }}>{post.author_initials}</span>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)" }}>{post.author_name}</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>{dateStr} · {post.read_time}</div>
            </div>
          </div>
          <button onClick={handleUpvote} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, background: upvoted ? `oklch(72% 0.19 ${hue} / 0.15)` : "rgba(255,255,255,0.04)", border: `1px solid ${upvoted ? `oklch(72% 0.19 ${hue} / 0.5)` : "var(--border)"}`, cursor: "pointer", transition: "all 0.15s" }}>
            <Icon name="arrowUp" size={12} color={upvoted ? `oklch(72% 0.19 ${hue})` : "var(--text3)"} />
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-space)", color: upvoted ? `oklch(72% 0.19 ${hue})` : "var(--text3)" }}>{count}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}

// ── Sidebar newsletter ────────────────────────────────────────────────────────
function SidebarNewsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const handleSubscribe = async () => {
    if (!email) return;
    const supabase = createClient();
    await supabase.from("newsletter_subscribers").insert({ email });
    setDone(true);
  };
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent-dim)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="zap" size={14} color="var(--accent)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-space)" }}>Weekly AI picks</div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>Every Thursday, no fluff.</div>
        </div>
      </div>
      {done ? (
        <p style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>You&apos;re in! ✓</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            style={{ padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border2)", color: "var(--text)", fontSize: 13, fontFamily: "var(--font-inter)", outline: "none" }}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border2)")} />
          <button onClick={handleSubscribe} style={{ padding: 9, borderRadius: 8, background: "var(--accent)", border: "none", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-inter)" }}>Subscribe free</button>
        </div>
      )}
    </div>
  );
}

// ── Main blog page ────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Deep Dive", "Roundup", "Guide", "News", "Opinion"];
const TOPICS = ["Writing", "Code", "Image Gen", "Video", "Research", "Productivity", "Opinion", "News", "Roundup", "Guide"];

export default function BlogPage({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const featured = posts[0];
  const remaining = posts.slice(1).filter(p =>
    (activeCategory === "All" || p.category === activeCategory) &&
    (query === "" || p.title.toLowerCase().includes(query.toLowerCase()) || p.excerpt.toLowerCase().includes(query.toLowerCase()))
  );

  const trending = [...posts].sort((a, b) => b.upvote_count - a.upvote_count).slice(0, 4);

  return (
    <div>
      {/* Page header */}
      <div style={{ paddingTop: 100, paddingBottom: 60, borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: "10%", width: 500, height: 500, background: "radial-gradient(ellipse, oklch(72% 0.19 52 / 0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div className="blog-page-header-inner" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Icon name="rss" size={14} color="var(--accent)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>From the editors</span>
              </div>
              <h1 className="blog-page-title" style={{ fontFamily: "var(--font-space)", fontSize: 52, fontWeight: 700, letterSpacing: "-0.05em", color: "var(--text)", lineHeight: 1.05, margin: 0 }}>The Blog</h1>
              <p style={{ fontSize: 17, color: "var(--text2)", marginTop: 10, maxWidth: 480 }}>Deep dives, roundups, and opinion from the PromptBulletin editorial team.</p>
            </div>

            {/* Search */}
            <div className="blog-search-bar" style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg3)", border: `1px solid ${focused ? "var(--accent)" : "var(--border2)"}`, borderRadius: 12, padding: "6px 6px 6px 16px", minWidth: 300, transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: focused ? "0 0 0 3px oklch(72% 0.19 52 / 0.1)" : "none" }}>
              <Icon name="search" size={16} color="var(--text3)" />
              <input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                placeholder="Search articles…"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "var(--font-inter)", padding: "6px 0" }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        {/* Category tabs */}
        <div style={{ display: "flex", gap: 4, padding: "20px 0", overflowX: "auto", borderBottom: "1px solid var(--border)", marginBottom: 48 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "7px 18px", borderRadius: 100, fontSize: 13, fontWeight: 500, background: activeCategory === cat ? "var(--accent)" : "transparent", border: `1px solid ${activeCategory === cat ? "var(--accent)" : "var(--border)"}`, color: activeCategory === cat ? "#000" : "var(--text2)", cursor: "pointer", fontFamily: "var(--font-inter)", transition: "all 0.15s", whiteSpace: "nowrap" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Featured post (only when unfiltered) */}
        {activeCategory === "All" && query === "" && featured && (
          <div style={{ marginBottom: 48 }}>
            <FeaturedPost post={featured} />
          </div>
        )}

        {/* Grid + Sidebar */}
        <div className="blog-layout" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40, paddingBottom: 80 }}>
          {/* Articles */}
          <div>
            {remaining.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)", fontSize: 15 }}>
                {posts.length === 0 ? "No articles published yet." : "No articles match your filter."}
              </div>
            ) : (
              <>
                {remaining.length >= 2 && (
                  <div className="blog-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 16 }}>
                    {remaining.slice(0, 2).map(p => <PostCard key={p.id} post={p} large />)}
                  </div>
                )}
                {remaining.length === 1 && (
                  <div style={{ marginBottom: 16 }}>
                    <PostCard post={remaining[0]} large />
                  </div>
                )}
                {remaining.length > 2 && (
                  <div className="blog-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    {remaining.slice(2).map(p => <PostCard key={p.id} post={p} />)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="blog-sidebar" style={{ display: "flex", flexDirection: "column" }}>
            <SidebarNewsletter />

            {/* Trending */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Trending this week</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {trending.map((p, i) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: i < trending.length - 1 ? "1px solid var(--border)" : "none", textDecoration: "none", transition: "opacity 0.15s" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
                    <span style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--border2)", letterSpacing: "-0.04em", lineHeight: 1, flexShrink: 0, width: 28 }}>0{i + 1}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.4, marginBottom: 4 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>{p.upvote_count} upvotes · {p.read_time}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Topics</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {TOPICS.map(t => (
                  <button key={t} onClick={() => { setActiveCategory(CATEGORIES.includes(t) ? t : "All"); }} style={{ padding: "5px 12px", borderRadius: 100, background: "transparent", border: "1px solid var(--border)", color: "var(--text3)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-inter)", transition: "all 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--text2)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
