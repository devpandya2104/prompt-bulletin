"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { BlogPostDetail, BodyBlock } from "@/lib/queries";

// ── Reading progress bar ──────────────────────────────────────────
function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setPct(total > 0 ? (scrolled / total) * 100 : 0);
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

// ── Table of contents ─────────────────────────────────────────────
type TocEntry = { id: string; text: string };

function Toc({ entries, activeId }: { entries: TocEntry[]; activeId: string }) {
  if (entries.length === 0) return null;
  return (
    <nav className="sticky top-24">
      <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text3)" }}>
        In this article
      </p>
      <ul className="space-y-1 list-none p-0 m-0">
        {entries.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              className="block text-sm py-1 pl-3 transition-all no-underline"
              style={{
                color: activeId === e.id ? "var(--accent)" : "var(--text3)",
                borderLeft: `2px solid ${activeId === e.id ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ── Body block renderer ───────────────────────────────────────────
function Block({ block }: { block: BodyBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 id={block.id} className="text-2xl font-bold mt-10 mb-4 scroll-mt-28"
          style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
          {block.text}
        </h2>
      );

    case "p":
      return (
        <p className="text-[17px] leading-[1.8] mb-5"
          style={{ fontFamily: "var(--font-lora)", color: "var(--text2)" }}>
          {block.text}
        </p>
      );

    case "callout": {
      const colors: Record<string, { bg: string; border: string; icon: string }> = {
        info:    { bg: "var(--accent2-dim)",  border: "var(--accent2)", icon: "ℹ" },
        tip:     { bg: "var(--accent-dim)",   border: "var(--accent)",  icon: "✦" },
        warning: { bg: "var(--red-dim)",      border: "var(--red)",     icon: "⚠" },
      };
      const c = colors[block.variant] ?? colors.info;
      return (
        <div className="rounded-xl p-5 my-6 flex gap-4"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <span className="text-lg mt-0.5 shrink-0" style={{ color: c.border }}>{c.icon}</span>
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-space)" }}>
              {block.title}
            </p>
            <p className="text-sm leading-relaxed m-0" style={{ color: "var(--text2)", fontFamily: "var(--font-lora)" }}>
              {block.text}
            </p>
          </div>
        </div>
      );
    }

    case "pullquote":
      return (
        <blockquote className="my-8 pl-6 py-1"
          style={{ borderLeft: "3px solid var(--accent)" }}>
          <p className="text-xl leading-[1.7] font-medium italic m-0"
            style={{ fontFamily: "var(--font-lora)", color: "var(--text)" }}>
            &ldquo;{block.text}&rdquo;
          </p>
        </blockquote>
      );

    case "datapoints":
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
          {block.items.map((item, i) => (
            <div key={i} className="rounded-xl p-4 text-center"
              style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)", fontFamily: "var(--font-space)" }}>
                {item.value}
              </div>
              <div className="text-xs" style={{ color: "var(--text3)" }}>{item.label}</div>
            </div>
          ))}
        </div>
      );

    case "table":
      return (
        <div className="overflow-x-auto my-6 rounded-xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: "var(--bg3)" }}>
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold"
                    style={{ color: "var(--text)", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-space)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: ri < block.rows.length - 1 ? "1px solid var(--border)" : "none" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3" style={{ color: ci === 0 ? "var(--text)" : "var(--text2)" }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "toolcta":
      return (
        <div className="rounded-xl p-6 my-8 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}>
          <div>
            <p className="font-bold text-sm mb-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-space)" }}>
              {block.tool_name}
            </p>
            <p className="text-sm m-0" style={{ color: "var(--text2)" }}>{block.cta_text}</p>
          </div>
          <Link href={`/tools/${block.tool_slug}`}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold no-underline transition-opacity hover:opacity-85"
            style={{ background: "var(--accent)", color: "#000" }}>
            View Tool →
          </Link>
        </div>
      );

    default:
      return null;
  }
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

// ── Main component ────────────────────────────────────────────────
export default function ArticlePage({ post }: { post: BlogPostDetail }) {
  const [activeId,   setActiveId]   = useState("");
  const [upvoted,    setUpvoted]    = useState(false);
  const [upvotes,    setUpvotes]    = useState(post.upvote_count);
  const [saved,      setSaved]      = useState(false);
  const [copied,     setCopied]     = useState(false);
  const observersRef = useRef<IntersectionObserver[]>([]);

  const tocEntries: TocEntry[] = (post.body_blocks ?? [])
    .filter((b): b is Extract<BodyBlock, { type: "h2" }> => b.type === "h2")
    .map((b) => ({ id: b.id, text: b.text }));

  // IntersectionObserver for TOC active tracking
  useEffect(() => {
    observersRef.current.forEach((o) => o.disconnect());
    observersRef.current = [];

    tocEntries.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: "-20% 0px -70% 0px" }
      );
      obs.observe(el);
      observersRef.current.push(obs);
    });

    return () => observersRef.current.forEach((o) => o.disconnect());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.slug]);

  const handleUpvote = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.dispatchEvent(new Event("open-auth")); return; }
    const next = !upvoted;
    setUpvoted(next);
    setUpvotes((n) => n + (next ? 1 : -1));
    const col = next ? "upvote_count + 1" : "upvote_count - 1";
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
        <div className="max-w-[720px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text3)" }}>
            <Link href="/" className="no-underline hover:underline" style={{ color: "var(--text3)" }}>Home</Link>
            <span>/</span>
            <Link href="/blog" className="no-underline hover:underline" style={{ color: "var(--text3)" }}>Blog</Link>
            <span>/</span>
            <span style={{ color: "var(--text2)" }}>{post.category}</span>
          </div>

          {/* Category */}
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5"
            style={{ background: `${categoryColor(post.category)}22`, color: categoryColor(post.category) }}>
            {post.category}
          </span>

          {/* Title */}
          <h1 className="article-h1 text-[42px] font-bold leading-[1.15] tracking-tight mb-5"
            style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
            {post.title}
          </h1>

          {/* Subtitle / excerpt */}
          <p className="article-subtitle text-[19px] leading-[1.65] mb-8 italic"
            style={{ fontFamily: "var(--font-lora)", color: "var(--text2)" }}>
            {post.excerpt}
          </p>

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

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ borderTop: "1px solid var(--border)" }} />
      </div>

      {/* 3-col layout */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] gap-10">
        {/* TOC */}
        <div className="hidden lg:block">
          <Toc entries={tocEntries} activeId={activeId} />
        </div>

        {/* Article body */}
        <article className="min-w-0">
          {(post.body_blocks ?? []).map((block, i) => (
            <Block key={i} block={block} />
          ))}

          {/* Tags */}
          {(post.tags ?? []).length > 0 && (
            <div className="mt-10 pt-8 flex flex-wrap gap-2" style={{ borderTop: "1px solid var(--border)" }}>
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text2)" }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author bio */}
          {post.author_bio && (
            <div className="mt-8 p-6 rounded-xl flex gap-4 flex-wrap sm:flex-nowrap"
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
          )}

          {/* Back to blog */}
          <div className="mt-10">
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
        </article>

        {/* Right column (empty — reserved for future ads/widgets) */}
        <div className="hidden lg:block" />
      </div>
    </main>
  );
}
