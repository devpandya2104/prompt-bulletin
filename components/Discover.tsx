"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tool, Category } from "@/lib/queries";
import type { DiscoverConfig } from "@/lib/site-config";
import { DEFAULT_DISCOVER } from "@/lib/site-config";
import ToolCard from "./ToolCard";

const sorts = [
  { id: "upvotes",  label: "Most Upvoted" },
  { id: "trending", label: "Trending" },
  { id: "rating",   label: "Top Rated" },
  { id: "newest",   label: "Newest" },
];

export default function Discover({ tools, categories, config = DEFAULT_DISCOVER }: {
  tools: Tool[];
  categories: Category[];
  config?: DiscoverConfig;
}) {
  const [sort,        setSort]        = useState("upvotes");
  const [filterCat,   setFilterCat]   = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [userUpvotes, setUserUpvotes] = useState<string[]>([]);

  useEffect(() => {
    const loadUpvotes = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("upvotes").select("tool_id").eq("user_id", user.id);
      setUserUpvotes(data?.map((u) => u.tool_id) ?? []);
    };
    loadUpvotes();
    const { data: { subscription } } = createClient().auth.onAuthStateChange(() => loadUpvotes());
    return () => subscription.unsubscribe();
  }, []);

  const filtered = tools
    .filter((t) => filterCat === "all" || (t.categories as any)?.slug === filterCat)
    .filter((t) => {
      if (filterPrice === "free") return t.pricing.toLowerCase().includes("free");
      if (filterPrice === "paid") return !t.pricing.toLowerCase().startsWith("free");
      return true;
    })
    .sort((a, b) => {
      if (sort === "rating")  return b.rating - a.rating;
      if (sort === "newest")  return 0;
      return b.upvote_count - a.upvote_count;
    });

  const selectStyle: React.CSSProperties = {
    padding: "7px 12px", borderRadius: 8,
    background: "var(--bg3)", border: "1px solid var(--border)",
    color: "var(--text2)", fontSize: 13, fontFamily: "var(--font-inter)", cursor: "pointer", outline: "none",
  };

  return (
    <section id="discover" className="py-20 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>{config.eyebrow}</p>
          <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>{config.heading}</h2>
        </div>

        <div className="discover-filter-bar flex gap-3 mb-7 flex-wrap items-center justify-between">
          <div className="flex gap-1 p-1 rounded-xl flex-wrap" style={{ background: "var(--bg3)" }}>
            {sorts.map((s) => (
              <button key={s.id} onClick={() => setSort(s.id)}
                className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150"
                style={{
                  background: sort === s.id ? "var(--bg2)" : "transparent",
                  border:     sort === s.id ? "1px solid var(--border2)" : "1px solid transparent",
                  color:      sort === s.id ? "var(--text)" : "var(--text2)",
                  fontFamily: "var(--font-inter)",
                }}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={selectStyle}>
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} style={selectStyle}>
              <option value="all">Any pricing</option>
              <option value="free">Has free tier</option>
              <option value="paid">Paid only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => <ToolCard key={tool.id} tool={tool} userUpvotes={userUpvotes} />)}
        </div>

        <div className="text-center mt-10">
          <button className="px-8 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150"
            style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--text2)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "var(--border2)"; }}>
            Load more tools
          </button>
        </div>
      </div>
    </section>
  );
}
