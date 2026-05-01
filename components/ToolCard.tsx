"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tool } from "@/lib/queries";

const tagColors: Record<string, { bg: string; color: string }> = {
  editor: { bg: "oklch(72% 0.19 52 / 0.15)",  color: "var(--accent)"  },
  top:    { bg: "oklch(72% 0.19 198 / 0.12)", color: "var(--accent2)" },
};
const badgeColors: Record<string, string> = { Trending: "#f59e0b", Hot: "#ef4444", New: "#10b981" };

export default function ToolCard({ tool, userUpvotes }: { tool: Tool; userUpvotes?: string[] }) {
  const [upvoted, setUpvoted] = useState(userUpvotes?.includes(tool.id) ?? false);
  const [count,   setCount]   = useState(tool.upvote_count);
  const [hover,   setHover]   = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUpvoted(userUpvotes?.includes(tool.id) ?? false);
  }, [userUpvotes, tool.id]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Show sign-in prompt — dispatch a custom event the Navbar listens to
      window.dispatchEvent(new CustomEvent("open-auth"));
      return;
    }

    setLoading(true);
    const willUpvote = !upvoted;
    setUpvoted(willUpvote);
    setCount((c) => willUpvote ? c + 1 : c - 1);

    if (willUpvote) {
      await supabase.from("upvotes").insert({ tool_id: tool.id, user_id: user.id });
      await supabase.rpc("increment_upvote", { tool_id: tool.id });
    } else {
      await supabase.from("upvotes").delete().eq("tool_id", tool.id).eq("user_id", user.id);
      await supabase.rpc("decrement_upvote", { tool_id: tool.id });
    }
    setLoading(false);
  };

  const formatCount = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col gap-3.5"
      style={{
        background: hover ? "rgba(255,255,255,0.03)" : "var(--bg2)",
        border:     `1px solid ${hover ? "var(--border2)" : "var(--border)"}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-base font-bold" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>{tool.name}</span>
            {tool.tag && tool.tag_type && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: tagColors[tool.tag_type]?.bg, color: tagColors[tool.tag_type]?.color }}>
                {tool.tag}
              </span>
            )}
            {tool.badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: `${badgeColors[tool.badge]}22`, color: badgeColors[tool.badge] }}>
                {tool.badge}
              </span>
            )}
          </div>
          <p className="text-[13.5px] leading-snug m-0" style={{ color: "var(--text2)" }}>{tool.description}</p>
        </div>

        <button onClick={handleUpvote} disabled={loading}
          className="flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl flex-shrink-0 transition-all duration-150 cursor-pointer disabled:opacity-70"
          style={{
            background: upvoted ? "var(--accent-dim)" : "rgba(255,255,255,0.04)",
            border:     `1px solid ${upvoted ? "var(--accent)" : "var(--border)"}`,
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={upvoted ? "var(--accent)" : "var(--text3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
          <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-space)", color: upvoted ? "var(--accent)" : "var(--text3)" }}>
            {formatCount(count)}
          </span>
        </button>
      </div>

      <div className="flex items-center justify-between pt-3 flex-wrap gap-2" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{tool.rating}</span>
            <span className="text-xs" style={{ color: "var(--text3)" }}>({tool.review_count})</span>
          </div>
          <span className="text-xs" style={{ color: "var(--text3)" }}>|</span>
          <span className="text-xs font-medium" style={{ color: "var(--text3)" }}>{tool.pricing}</span>
        </div>
        <div className="flex gap-1">
          {tool.platforms.slice(0, 2).map((p) => (
            <span key={p} className="text-[11px] px-2 py-0.5 rounded-md font-medium" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text3)" }}>{p}</span>
          ))}
          {tool.platforms.length > 2 && (
            <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text3)" }}>+{tool.platforms.length - 2}</span>
          )}
        </div>
      </div>
    </div>
  );
}
