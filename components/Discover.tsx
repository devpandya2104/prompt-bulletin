"use client";
import { useState } from "react";
import { TOOLS, CATEGORIES } from "@/lib/data";
import ToolCard from "./ToolCard";

const sorts = [
  { id: "upvotes",  label: "Most Upvoted" },
  { id: "trending", label: "Trending" },
  { id: "rating",   label: "Top Rated" },
  { id: "newest",   label: "Newest" },
];

export default function Discover() {
  const [sort,        setSort]        = useState("upvotes");
  const [filterCat,   setFilterCat]   = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");

  const filtered = TOOLS
    .filter((t) => filterCat === "all" || t.category === filterCat)
    .filter((t) => {
      if (filterPrice === "free") return t.pricing.includes("Free");
      if (filterPrice === "paid") return !t.pricing.startsWith("Free");
      return true;
    })
    .sort((a, b) => sort === "rating" ? b.rating - a.rating : b.upvotes - a.upvotes);

  const selectStyle: React.CSSProperties = {
    padding: "7px 12px", borderRadius: 8,
    background: "var(--bg3)", border: "1px solid var(--border)",
    color: "var(--text2)", fontSize: 13,
    fontFamily: "var(--font-inter)", cursor: "pointer", outline: "none",
  };

  return (
    <section id="discover" className="py-20 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Featured tools</p>
          <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>Top-rated this month</h2>
        </div>

        {/* Toolbar */}
        <div className="flex gap-3 mb-7 flex-wrap items-center justify-between">
          {/* Sort tabs */}
          <div className="flex gap-1 p-1 rounded-xl flex-wrap" style={{ background: "var(--bg3)" }}>
            {sorts.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150"
                style={{
                  background: sort === s.id ? "var(--bg2)"       : "transparent",
                  border:     sort === s.id ? "1px solid var(--border2)" : "1px solid transparent",
                  color:      sort === s.id ? "var(--text)"       : "var(--text2)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          {/* Filters */}
          <div className="flex gap-2">
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={selectStyle}>
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} style={selectStyle}>
              <option value="all">Any pricing</option>
              <option value="free">Has free tier</option>
              <option value="paid">Paid only</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </div>

        <div className="text-center mt-10">
          <button
            className="px-8 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150"
            style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--text2)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "var(--border2)"; }}
          >
            Load more tools
          </button>
        </div>
      </div>
    </section>
  );
}
