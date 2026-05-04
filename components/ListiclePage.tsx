"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { BlogPostDetail, ListItem } from "@/lib/queries";

// ── Reading progress ──────────────────────────────────────────────
function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setPct(total > 0 ? (el.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px]" style={{ background: "var(--bg3)" }}>
      <div className="h-full transition-all duration-100" style={{ width: `${pct}%`, background: "var(--accent)" }} />
    </div>
  );
}

// ── Stars ─────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="13" height="13" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "var(--accent)" : "none"}
          stroke="var(--accent)" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

// ── Rank colors (top 3 get gradient accent) ───────────────────────
function rankStyle(rank: number): { color: string; bg: string } {
  if (rank === 1) return { color: "var(--accent)",  bg: "var(--accent-dim)"  };
  if (rank === 2) return { color: "var(--accent2)", bg: "var(--accent2-dim)" };
  if (rank === 3) return { color: "var(--green)",   bg: "var(--green-dim)"   };
  return { color: "var(--text3)", bg: "var(--bg3)" };
}

// ── Category badge colour ─────────────────────────────────────────
function categoryColor(cat: string) {
  const map: Record<string, string> = {
    "Deep Dive": "var(--accent)",
    "Roundup":   "var(--accent2)",
    "Guide":     "var(--green)",
    "News":      "var(--red)",
    "Opinion":   "oklch(72% 0.19 290)",
  };
  return map[cat] ?? "var(--text3)";
}

// ── Tool item card ────────────────────────────────────────────────
function ToolItemCard({ item, visible }: { item: ListItem; visible: boolean }) {
  const rs = rankStyle(item.rank);
  return (
    <article
      id={`item-${item.rank}`}
      className="rounded-2xl overflow-hidden transition-all duration-700"
      style={{
        background: "var(--bg2)",
        border: `1px solid var(--border)`,
        borderTop: `2px solid ${rs.color}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
      }}
    >
      <div className="p-6 sm:p-8 grid grid-cols-[auto_1fr] gap-6 sm:gap-8">
        {/* Rank column */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black"
            style={{ background: rs.bg, color: rs.color, fontFamily: "var(--font-space)" }}>
            #{item.rank}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="text-xl font-bold m-0" style={{ color: "var(--text)", fontFamily: "var(--font-space)" }}>
                  {item.tool_name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: `${rs.color}22`, color: rs.color }}>
                  {item.verdict}
                </span>
                {item.has_free_tier && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: "var(--green-dim)", color: "var(--green)" }}>
                    Free tier
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: "var(--text3)" }}>{item.category}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Stars rating={item.rating} />
              <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{item.rating}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{item.pricing}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-[16px] leading-[1.75] mb-5"
            style={{ fontFamily: "var(--font-lora)", color: "var(--text2)" }}>
            {item.description}
          </p>

          {/* Pros/Cons */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl p-4" style={{ background: "var(--green-dim)", border: "1px solid var(--green)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--green)" }}>Pros</p>
              <ul className="space-y-2 list-none p-0 m-0">
                {item.pros.map((pro, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text2)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" className="mt-0.5 shrink-0">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-4" style={{ background: "var(--red-dim)", border: "1px solid var(--red)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--red)" }}>Cons</p>
              <ul className="space-y-2 list-none p-0 m-0">
                {item.cons.map((con, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text2)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" className="mt-0.5 shrink-0">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap">
            {item.tool_slug ? (
              <Link href={`/tools/${item.tool_slug}`}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold no-underline transition-opacity hover:opacity-85"
                style={{ background: "var(--accent)", color: "#000" }}>
                View Full Review →
              </Link>
            ) : (
              <span className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed opacity-50"
                style={{ background: "var(--accent)", color: "#000" }}>
                Review Coming Soon
              </span>
            )}
            <a href="#" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg text-sm font-medium no-underline transition-all"
              style={{ border: "1px solid var(--border2)", color: "var(--text2)", background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text2)")}>
              Try {item.tool_name} ↗
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Sticky item navigator ─────────────────────────────────────────
function ItemNavigator({ items, activeRank }: { items: ListItem[]; activeRank: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current?.querySelector(`[data-rank="${activeRank}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeRank]);

  return (
    <div className="sticky top-16 z-40 py-3" style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
      <div ref={scrollRef} className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {items.map((item) => (
          <a
            key={item.rank}
            href={`#item-${item.rank}`}
            data-rank={item.rank}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium no-underline transition-all whitespace-nowrap"
            style={{
              background: activeRank === item.rank ? "var(--accent)" : "var(--bg3)",
              color: activeRank === item.rank ? "#000" : "var(--text2)",
              border: `1px solid ${activeRank === item.rank ? "var(--accent)" : "var(--border)"}`,
            }}>
            #{item.rank} {item.tool_name}
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function ListiclePage({ post }: { post: BlogPostDetail }) {
  const items = (post.list_items ?? []) as ListItem[];
  const [activeRank,  setActiveRank]  = useState(items[0]?.rank ?? 1);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [upvoted,      setUpvoted]     = useState(false);
  const [upvotes,      setUpvotes]     = useState(post.upvote_count);
  const [saved,        setSaved]       = useState(false);
  const [copied,       setCopied]      = useState(false);

  // Scroll-in animation for tool cards
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    items.forEach((item) => {
      const el = document.getElementById(`item-${item.rank}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, item.rank]));
            setActiveRank(item.rank);
          }
        },
        { rootMargin: "-10% 0px -60% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.slug]);

  const handleUpvote = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.dispatchEvent(new Event("open-auth")); return; }
    const next = !upvoted;
    setUpvoted(next);
    setUpvotes((n) => n + (next ? 1 : -1));
    await supabase.rpc(next ? "increment_blog_upvote" : "decrement_blog_upvote", { post_id: post.id });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {/* ignore */}
  };

  const pubDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  return (
    <main className="pt-16 min-h-screen" style={{ background: "var(--bg)" }}>
      <ReadingProgress />

      {/* Hero */}
      <section className="px-6 pt-14 pb-10 max-w-7xl mx-auto">
        <div className="max-w-[820px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text3)" }}>
            <Link href="/" className="no-underline hover:underline" style={{ color: "var(--text3)" }}>Home</Link>
            <span>/</span>
            <Link href="/blog" className="no-underline hover:underline" style={{ color: "var(--text3)" }}>Blog</Link>
            <span>/</span>
            <span style={{ color: "var(--text2)" }}>{post.category}</span>
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: `${categoryColor(post.category)}22`, color: categoryColor(post.category) }}>
              {post.category}
            </span>
            {(post.tags ?? []).slice(0, 3).map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text3)" }}>
                {tag}
              </span>
            ))}
          </div>

          <h1 className="listicle-h1 text-[46px] font-black leading-[1.1] tracking-tight mb-5"
            style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
            {post.title}
          </h1>
          <p className="text-[18px] leading-[1.65] mb-6 italic"
            style={{ fontFamily: "var(--font-lora)", color: "var(--text2)" }}>
            {post.excerpt}
          </p>

          {/* Methodology note */}
          <div className="rounded-xl p-4 mb-8 flex gap-3"
            style={{ background: "var(--bg3)", border: "1px solid var(--border2)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            <p className="text-sm m-0" style={{ color: "var(--text2)" }}>
              <strong style={{ color: "var(--text)" }}>Our methodology:</strong> We tested {items.length}+ tools over 60 days with real marketing workflows. Rankings based on output quality, ease of use, value, and reliability. No tools paid for placement.
            </p>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent)" }}>
              {post.author_initials}
            </div>
            <div>
              <p className="font-semibold text-sm m-0" style={{ color: "var(--text)" }}>{post.author_name}</p>
              {post.author_role && (
                <p className="text-xs m-0" style={{ color: "var(--text3)" }}>{post.author_role}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm" style={{ color: "var(--text3)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              {post.read_time}
            </div>
            <span style={{ color: "var(--border2)" }}>·</span>
            <span className="text-sm" style={{ color: "var(--text3)" }}>{pubDate}</span>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <button onClick={handleUpvote}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all"
                style={{
                  background: upvoted ? "var(--accent-dim)" : "var(--bg3)",
                  border: `1px solid ${upvoted ? "var(--accent)" : "var(--border2)"}`,
                  color: upvoted ? "var(--accent)" : "var(--text2)",
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={upvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M7 11l5-5 5 5M7 17l5-5 5 5"/>
                </svg>
                {upvotes}
              </button>
              <button onClick={() => setSaved(!saved)}
                className="p-2 rounded-lg cursor-pointer transition-all"
                style={{
                  background: saved ? "var(--accent-dim)" : "var(--bg3)",
                  border: `1px solid ${saved ? "var(--accent)" : "var(--border2)"}`,
                  color: saved ? "var(--accent)" : "var(--text2)",
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
              </button>
              <button onClick={handleShare}
                className="p-2 rounded-lg cursor-pointer transition-all"
                style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text2)" }}>
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <div style={{ borderTop: "1px solid var(--border)" }} />
      </div>

      {/* Quick comparison table */}
      {items.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-10">
          <div className="max-w-[820px] mx-auto">
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)", fontFamily: "var(--font-space)" }}>
              Quick Comparison
            </h2>
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ background: "var(--bg3)" }}>
                    {["Rank", "Tool", "Best For", "Rating", "Pricing", "Free Tier"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                        style={{ color: "var(--text)", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-space)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const rs = rankStyle(item.rank);
                    return (
                      <tr key={item.rank} style={{ borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <td className="px-4 py-3 font-bold" style={{ color: rs.color }}>#{item.rank}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: "var(--text)" }}>
                          <a href={`#item-${item.rank}`} className="no-underline hover:underline" style={{ color: "var(--text)" }}>
                            {item.tool_name}
                          </a>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--text2)" }}>{item.verdict}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text2)" }}>{item.rating}/5</td>
                        <td className="px-4 py-3" style={{ color: "var(--text2)" }}>{item.pricing}</td>
                        <td className="px-4 py-3">
                          {item.has_free_tier ? (
                            <span style={{ color: "var(--green)" }}>✓</span>
                          ) : (
                            <span style={{ color: "var(--red)" }}>✗</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Sticky navigator */}
      {items.length > 0 && <ItemNavigator items={items} activeRank={activeRank} />}

      {/* Tool items */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="max-w-[820px] mx-auto space-y-8">
          {items.map((item) => (
            <ToolItemCard key={item.rank} item={item} visible={visibleItems.has(item.rank)} />
          ))}
        </div>
      </section>

      {/* Methodology footer */}
      <section className="max-w-7xl mx-auto px-6 pb-14">
        <div className="max-w-[820px] mx-auto rounded-2xl p-8"
          style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
          <h3 className="font-bold text-lg mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-space)" }}>
            Our Methodology
          </h3>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text2)", fontFamily: "var(--font-lora)" }}>
            Every tool in this roundup was tested by our editorial team over a minimum of 30 days using real-world tasks.
            Rankings are based on a weighted score across Output Quality (35%), Ease of Use (30%), Value for Money (25%), and Reliability (10%).
            No tool paid for placement or a higher ranking.
          </p>
          <Link href="/blog/how-we-score-ai-tools"
            className="text-sm font-medium no-underline transition-colors"
            style={{ color: "var(--accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
            Read our full scoring methodology →
          </Link>
        </div>
      </section>

      {/* Author bio */}
      {post.author_bio && (
        <section className="max-w-7xl mx-auto px-6 pb-14">
          <div className="max-w-[820px] mx-auto p-6 rounded-xl flex gap-4 flex-wrap sm:flex-nowrap"
            style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
              style={{ background: "var(--accent-dim)", border: "2px solid var(--accent)", color: "var(--accent)" }}>
              {post.author_initials}
            </div>
            <div>
              <p className="font-bold mb-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-space)" }}>
                {post.author_name}
              </p>
              {post.author_role && (
                <p className="text-xs mb-2" style={{ color: "var(--accent)" }}>{post.author_role}</p>
              )}
              <p className="text-sm leading-relaxed m-0" style={{ color: "var(--text2)", fontFamily: "var(--font-lora)" }}>
                {post.author_bio}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="max-w-[820px] mx-auto">
          <Link href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium no-underline transition-colors"
            style={{ color: "var(--text3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>
    </main>
  );
}
