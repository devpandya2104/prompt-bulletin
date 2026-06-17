"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBlogPost, createBlogPost } from "@/app/admin/actions";
import ImageUpload from "./ImageUpload";
import RichTextEditor, { addHeadingIds } from "./RichTextEditor";
import type { BlogPostDetail, BodyBlock, ListItem, Author, ComparisonData, ComparisonRow, ComparisonTool } from "@/lib/queries";
import { BLOG_CATEGORIES } from "@/lib/site-config";

// ── Shared styles ─────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)",
  color: "var(--text)", fontSize: 13, fontFamily: "var(--font-inter)",
  outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--text3)",
  textTransform: "uppercase", letterSpacing: "0.08em",
  display: "block", marginBottom: 6,
};
const sectionStyle: React.CSSProperties = {
  background: "var(--bg2)", border: "1px solid var(--border)",
  borderRadius: 14, padding: 24, marginBottom: 20,
};
const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-space)", fontSize: 14, fontWeight: 700,
  color: "var(--text)", marginBottom: 20, paddingBottom: 14,
  borderBottom: "1px solid var(--border)",
};
const addBtnStyle: React.CSSProperties = {
  padding: "7px 14px", borderRadius: 7, border: "1px dashed var(--border2)",
  color: "var(--text3)", fontSize: 12, background: "transparent",
  cursor: "pointer", transition: "all 0.15s", marginTop: 8,
};
const removeBtnStyle: React.CSSProperties = {
  padding: "5px 9px", borderRadius: 6, border: "1px solid transparent",
  color: "var(--text3)", fontSize: 12, background: "transparent",
  cursor: "pointer", flexShrink: 0,
};
const iconBtnStyle: React.CSSProperties = {
  padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)",
  color: "var(--text3)", fontSize: 11, background: "transparent", cursor: "pointer",
};

// ── Field helpers ─────────────────────────────────────────────────
function Field({ label, children, col }: { label: string; children: React.ReactNode; col?: boolean }) {
  return (
    <div style={{ marginBottom: col ? 0 : 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Row({ children, cols = "1fr 1fr" }: { children: React.ReactNode; cols?: string }) {
  return <div style={{ display: "grid", gridTemplateColumns: cols, gap: 16, marginBottom: 16 }}>{children}</div>;
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} style={inputStyle}
      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} placeholder={placeholder} rows={rows}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div onClick={() => onChange(!checked)} style={{
        width: 40, height: 22, borderRadius: 11, position: "relative", cursor: "pointer",
        background: checked ? "var(--accent)" : "var(--bg3)",
        border: `1px solid ${checked ? "var(--accent)" : "var(--border2)"}`,
        transition: "all 0.2s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 2, left: checked ? 19 : 2,
          width: 16, height: 16, borderRadius: "50%",
          background: checked ? "#000" : "var(--text3)",
          transition: "left 0.2s",
        }} />
      </div>
      <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
    </label>
  );
}

function StringList({ items, onChange, placeholder }: {
  items: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <Input value={item} placeholder={placeholder}
            onChange={(v) => { const n = [...items]; n[i] = v; onChange(n); }} />
          <button style={removeBtnStyle} onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}>✕</button>
        </div>
      ))}
      <button style={addBtnStyle} onClick={() => onChange([...items, ""])}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}>
        + Add item
      </button>
    </div>
  );
}

// ── Special block editor (callout, table, toolcta, datapoints) ────
type SpecialBlockType = "callout" | "pullquote" | "datapoints" | "table" | "toolcta";

const SPECIAL_BLOCK_TYPES: { value: SpecialBlockType; label: string }[] = [
  { value: "callout",    label: "Callout / Info box" },
  { value: "pullquote",  label: "Pull quote" },
  { value: "datapoints", label: "Data points grid" },
  { value: "table",      label: "Comparison table" },
  { value: "toolcta",    label: "Tool CTA button" },
];

function newSpecialBlock(type: SpecialBlockType): BodyBlock {
  switch (type) {
    case "callout":    return { type, variant: "info", title: "", text: "" };
    case "pullquote":  return { type, text: "" };
    case "datapoints": return { type, items: [{ value: "", label: "" }] };
    case "table":      return { type, headers: ["Feature", "Value"], rows: [["", ""]] };
    case "toolcta":    return { type, tool_name: "", tool_slug: "", cta_text: "" };
  }
}

// Helper: convert old h2/p body_blocks to HTML for migration
function blocksToHtml(blocks: BodyBlock[]): string {
  return blocks
    .filter(b => b.type === "h2" || b.type === "p" || b.type === "pullquote")
    .map(b => {
      if (b.type === "h2") return `<h2>${b.text}</h2>`;
      if (b.type === "p") return `<p>${b.text}</p>`;
      if (b.type === "pullquote") return `<blockquote><p>${(b as { type: "pullquote"; text: string }).text}</p></blockquote>`;
      return "";
    })
    .join("");
}

function autoId(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
}

function BlockCard({ block, idx, total, onChange, onRemove, onMove }: {
  block: BodyBlock; idx: number; total: number;
  onChange: (b: BodyBlock) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const typeLabel = SPECIAL_BLOCK_TYPES.find((t) => t.value === block.type)?.label ?? block.type;

  return (
    <div style={{
      border: "1px solid var(--border2)", borderRadius: 12, marginBottom: 10, overflow: "hidden",
    }}>
      {/* Block header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px", background: "var(--bg3)", borderBottom: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {typeLabel}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={iconBtnStyle} onClick={() => onMove(-1)} disabled={idx === 0}>↑</button>
          <button style={iconBtnStyle} onClick={() => onMove(1)} disabled={idx === total - 1}>↓</button>
          <button style={{ ...removeBtnStyle, border: "1px solid var(--border)" }} onClick={onRemove}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--red)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text3)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
            Remove
          </button>
        </div>
      </div>

      {/* Block fields */}
      <div style={{ padding: 14 }}>
        {block.type === "callout" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <label style={labelStyle}>Variant</label>
                <Select value={block.variant} onChange={(v) => onChange({ ...block, variant: v as "info" | "tip" | "warning" })}
                  options={[{ value: "info", label: "Info (blue)" }, { value: "tip", label: "Tip (orange)" }, { value: "warning", label: "Warning (red)" }]} />
              </div>
              <div>
                <label style={labelStyle}>Title</label>
                <Input value={block.title} placeholder="Callout title" onChange={(v) => onChange({ ...block, title: v })} />
              </div>
            </div>
            <label style={labelStyle}>Body text</label>
            <Textarea value={block.text} rows={3} placeholder="Callout body…"
              onChange={(v) => onChange({ ...block, text: v })} />
          </>
        )}

        {block.type === "pullquote" && (
          <>
            <label style={labelStyle}>Quote text</label>
            <Textarea value={block.text} rows={3} placeholder="A compelling quote…"
              onChange={(v) => onChange({ ...block, text: v })} />
          </>
        )}

        {block.type === "datapoints" && (
          <>
            <label style={labelStyle}>Data points (value + label pairs)</label>
            {block.items.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 8, marginBottom: 8 }}>
                <Input value={item.value} placeholder="35%" onChange={(v) => {
                  const items = [...block.items]; items[i] = { ...items[i], value: v };
                  onChange({ ...block, items });
                }} />
                <Input value={item.label} placeholder="Label text" onChange={(v) => {
                  const items = [...block.items]; items[i] = { ...items[i], label: v };
                  onChange({ ...block, items });
                }} />
                <button style={removeBtnStyle} onClick={() => onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) })}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}>✕</button>
              </div>
            ))}
            <button style={addBtnStyle} onClick={() => onChange({ ...block, items: [...block.items, { value: "", label: "" }] })}>+ Add data point</button>
          </>
        )}

        {block.type === "table" && (
          <>
            {/* Headers */}
            <label style={labelStyle}>Column headers</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {block.headers.map((h, hi) => (
                <div key={hi} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <input value={h} placeholder={`Col ${hi + 1}`}
                    onChange={(e) => {
                      const headers = [...block.headers]; headers[hi] = e.target.value;
                      onChange({ ...block, headers });
                    }}
                    style={{ ...inputStyle, width: 120 }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
                  {block.headers.length > 1 && (
                    <button style={removeBtnStyle} onClick={() => {
                      const headers = block.headers.filter((_, idx) => idx !== hi);
                      const rows = block.rows.map((row) => row.filter((_, idx) => idx !== hi));
                      onChange({ ...block, headers, rows });
                    }}>✕</button>
                  )}
                </div>
              ))}
              <button style={addBtnStyle} onClick={() => {
                onChange({ ...block, headers: [...block.headers, ""], rows: block.rows.map((r) => [...r, ""]) });
              }}>+ Col</button>
            </div>

            {/* Rows */}
            <label style={labelStyle}>Rows</label>
            {block.rows.map((row, ri) => (
              <div key={ri} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                {row.map((cell, ci) => (
                  <input key={ci} value={cell} placeholder={block.headers[ci] ?? `Col ${ci + 1}`}
                    onChange={(e) => {
                      const rows = block.rows.map((r, ridx) =>
                        ridx === ri ? r.map((c, cidx) => cidx === ci ? e.target.value : c) : r
                      );
                      onChange({ ...block, rows });
                    }}
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
                ))}
                <button style={removeBtnStyle} onClick={() => onChange({ ...block, rows: block.rows.filter((_, idx) => idx !== ri) })}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}>✕</button>
              </div>
            ))}
            <button style={addBtnStyle} onClick={() => onChange({ ...block, rows: [...block.rows, block.headers.map(() => "")] })}>+ Add row</button>
          </>
        )}

        {block.type === "toolcta" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Tool name</label>
              <Input value={block.tool_name} placeholder="Cursor" onChange={(v) => onChange({ ...block, tool_name: v })} />
            </div>
            <div>
              <label style={labelStyle}>Tool slug</label>
              <Input value={block.tool_slug} placeholder="cursor" onChange={(v) => onChange({ ...block, tool_slug: v })} />
            </div>
            <div>
              <label style={labelStyle}>CTA text</label>
              <Input value={block.cta_text} placeholder="Try Cursor free — 2,000 completions included" onChange={(v) => onChange({ ...block, cta_text: v })} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecialBlocksEditor({ blocks, onChange }: { blocks: BodyBlock[]; onChange: (v: BodyBlock[]) => void }) {
  const [addType, setAddType] = useState<SpecialBlockType>("callout");

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...blocks];
    const swap = idx + dir;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "var(--text3)", margin: "0 0 12px" }}>
        Special blocks appear after the main article content. Use these for callout boxes, comparison tables, data highlights, and tool CTAs.
      </p>
      {blocks.map((block, i) => (
        <BlockCard key={i} block={block} idx={i} total={blocks.length}
          onChange={(b) => { const next = [...blocks]; next[i] = b; onChange(next); }}
          onRemove={() => onChange(blocks.filter((_, idx) => idx !== i))}
          onMove={(dir) => move(i, dir)} />
      ))}

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
        <Select value={addType} onChange={(v) => setAddType(v as SpecialBlockType)} options={SPECIAL_BLOCK_TYPES} />
        <button
          onClick={() => onChange([...blocks, newSpecialBlock(addType)])}
          style={{ padding: "9px 18px", borderRadius: 8, background: "var(--accent)", border: "none", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
          + Add block
        </button>
      </div>
    </div>
  );
}

// ── List item editor ──────────────────────────────────────────────
function ListItemCard({ item, idx, total, onChange, onRemove, onMove }: {
  item: ListItem; idx: number; total: number;
  onChange: (v: ListItem) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const rankColors: Record<number, string> = { 1: "var(--accent)", 2: "var(--accent2)", 3: "var(--green)" };
  const color = rankColors[item.rank] ?? "var(--text3)";

  return (
    <div style={{ border: `1px solid var(--border2)`, borderTop: `2px solid ${color}`, borderRadius: 12, marginBottom: 14, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "var(--font-space)" }}>
          #{item.rank} {item.tool_name || "Untitled"}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={iconBtnStyle} onClick={() => onMove(-1)} disabled={idx === 0}>↑</button>
          <button style={iconBtnStyle} onClick={() => onMove(1)} disabled={idx === total - 1}>↓</button>
          <button style={{ ...removeBtnStyle, border: "1px solid var(--border)" }} onClick={onRemove}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--red)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text3)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
            Remove
          </button>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 100px", gap: 10, marginBottom: 12 }}>
          <div><label style={labelStyle}>Rank</label>
            <Input type="number" value={item.rank} onChange={(v) => onChange({ ...item, rank: parseInt(v) || 1 })} /></div>
          <div><label style={labelStyle}>Tool name</label>
            <Input value={item.tool_name} placeholder="Jasper AI" onChange={(v) => onChange({ ...item, tool_name: v })} /></div>
          <div><label style={labelStyle}>Tool slug (or blank)</label>
            <Input value={item.tool_slug ?? ""} placeholder="jasper-ai" onChange={(v) => onChange({ ...item, tool_slug: v || null })} /></div>
          <div><label style={labelStyle}>Category</label>
            <Input value={item.category} placeholder="Long-form Content" onChange={(v) => onChange({ ...item, category: v })} /></div>
          <div><label style={labelStyle}>Rating</label>
            <Input type="number" value={item.rating} onChange={(v) => onChange({ ...item, rating: parseFloat(v) || 0 })} /></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div><label style={labelStyle}>Pricing</label>
            <Input value={item.pricing} placeholder="Free / $49/mo" onChange={(v) => onChange({ ...item, pricing: v })} /></div>
          <div><label style={labelStyle}>Verdict label</label>
            <Input value={item.verdict} placeholder="Best Overall" onChange={(v) => onChange({ ...item, verdict: v })} /></div>
          <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div onClick={() => onChange({ ...item, has_free_tier: !item.has_free_tier })} style={{
                width: 36, height: 20, borderRadius: 10, position: "relative", cursor: "pointer",
                background: item.has_free_tier ? "var(--green)" : "var(--bg3)",
                border: `1px solid ${item.has_free_tier ? "var(--green)" : "var(--border2)"}`,
                transition: "all 0.2s", flexShrink: 0,
              }}>
                <div style={{ position: "absolute", top: 2, left: item.has_free_tier ? 17 : 2, width: 14, height: 14, borderRadius: "50%", background: item.has_free_tier ? "#000" : "var(--text3)", transition: "left 0.2s" }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--text2)" }}>Has free tier</span>
            </label>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Description (rich text — shown under the verdict badge)</label>
          <RichTextEditor
            value={item.description}
            onChange={(v) => onChange({ ...item, description: v })}
            placeholder="Describe this tool's strengths, who it's for, and what makes it stand out…"
            minHeight={100}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ ...labelStyle, color: "var(--green)" }}>Pros</label>
            <StringList items={item.pros} onChange={(v) => onChange({ ...item, pros: v })} placeholder="A strength…" />
          </div>
          <div>
            <label style={{ ...labelStyle, color: "var(--red)" }}>Cons</label>
            <StringList items={item.cons} onChange={(v) => onChange({ ...item, cons: v })} placeholder="A weakness…" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ListItemsEditor({ items, onChange }: { items: ListItem[]; onChange: (v: ListItem[]) => void }) {
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const swap = idx + dir;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    // Re-number ranks to match new order
    onChange(next.map((item, i) => ({ ...item, rank: i + 1 })));
  };

  const addItem = () => {
    onChange([...items, {
      rank: items.length + 1, tool_name: "", tool_slug: null,
      category: "", rating: 4.5, pricing: "", has_free_tier: false,
      verdict: "", description: "", pros: [], cons: [],
    }]);
  };

  return (
    <div>
      {items.map((item, i) => (
        <ListItemCard key={i} item={item} idx={i} total={items.length}
          onChange={(v) => { const next = [...items]; next[i] = v; onChange(next); }}
          onRemove={() => onChange(items.filter((_, idx) => idx !== i).map((it, i2) => ({ ...it, rank: i2 + 1 })))}
          onMove={(dir) => move(i, dir)} />
      ))}
      <button style={{ ...addBtnStyle, marginTop: 4 }} onClick={addItem}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}>
        + Add list item
      </button>
    </div>
  );
}

// ── Comparison editor ─────────────────────────────────────────────

function defaultComparisonData(): ComparisonData {
  return {
    tool_a: { name: "", slug: "", logo_url: "", website_url: "", pricing: "" },
    tool_b: { name: "", slug: "", logo_url: "", website_url: "", pricing: "" },
    quick_verdict: { summary: "", choose_a_if: [], choose_b_if: [] },
    comparison_table: [],
    features_html: "", pricing_html: "", ease_of_use_html: "", performance_html: "",
    pros_a: [], cons_a: [], pros_b: [], cons_b: [],
    use_cases_a: [], use_cases_b: [],
    final_verdict_html: "",
    faqs: [],
  };
}

function ToolFields({ label, tool, onChange, accentColor }: {
  label: string;
  tool: ComparisonTool;
  onChange: (t: ComparisonTool) => void;
  accentColor: string;
}) {
  return (
    <div style={{ background: "var(--bg3)", borderRadius: 10, padding: 16, border: `1px solid ${accentColor}` }}>
      <div style={{ ...labelStyle, color: accentColor, marginBottom: 12 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div><label style={labelStyle}>Name</label><Input value={tool.name} placeholder="Cursor" onChange={(v) => onChange({ ...tool, name: v })} /></div>
        <div><label style={labelStyle}>Slug</label><Input value={tool.slug} placeholder="cursor" onChange={(v) => onChange({ ...tool, slug: v })} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div><label style={labelStyle}>Website URL</label><Input value={tool.website_url} placeholder="https://cursor.sh" onChange={(v) => onChange({ ...tool, website_url: v })} /></div>
        <div><label style={labelStyle}>Pricing</label><Input value={tool.pricing} placeholder="Free / $20/mo" onChange={(v) => onChange({ ...tool, pricing: v })} /></div>
      </div>
      <div style={{ marginTop: 10 }}>
        <label style={labelStyle}>Logo URL</label>
        <Input value={tool.logo_url} placeholder="https://…/logo.png" onChange={(v) => onChange({ ...tool, logo_url: v })} />
      </div>
    </div>
  );
}

function ComparisonTableEditor({ rows, onChange }: { rows: ComparisonRow[]; onChange: (r: ComparisonRow[]) => void }) {
  return (
    <div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <Input value={row.feature} placeholder="Feature" onChange={(v) => { const n = [...rows]; n[i] = { ...n[i], feature: v }; onChange(n); }} />
          <Input value={row.tool_a} placeholder="Tool A value" onChange={(v) => { const n = [...rows]; n[i] = { ...n[i], tool_a: v }; onChange(n); }} />
          <Input value={row.tool_b} placeholder="Tool B value" onChange={(v) => { const n = [...rows]; n[i] = { ...n[i], tool_b: v }; onChange(n); }} />
          <button style={removeBtnStyle} onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}>✕</button>
        </div>
      ))}
      {rows.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: "var(--text3)", padding: "0 4px" }}>Feature</div>
          <div style={{ fontSize: 11, color: "var(--accent)", padding: "0 4px" }}>Tool A</div>
          <div style={{ fontSize: 11, color: "var(--accent2)", padding: "0 4px" }}>Tool B</div>
          <div />
        </div>
      )}
      <button style={addBtnStyle} onClick={() => onChange([...rows, { feature: "", tool_a: "", tool_b: "" }])}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}>
        + Add row
      </button>
    </div>
  );
}

function FaqEditor({ faqs, onChange }: { faqs: { q: string; a: string }[]; onChange: (v: { q: string; a: string }[]) => void }) {
  return (
    <div>
      {faqs.map((faq, i) => (
        <div key={i} style={{ border: "1px solid var(--border2)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)" }}>FAQ #{i + 1}</span>
            <button style={removeBtnStyle} onClick={() => onChange(faqs.filter((_, idx) => idx !== i))}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}>Remove</button>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Question</label>
            <Input value={faq.q} placeholder="Question…" onChange={(v) => { const n = [...faqs]; n[i] = { ...n[i], q: v }; onChange(n); }} />
          </div>
          <div>
            <label style={labelStyle}>Answer</label>
            <Textarea value={faq.a} rows={3} placeholder="Answer…" onChange={(v) => { const n = [...faqs]; n[i] = { ...n[i], a: v }; onChange(n); }} />
          </div>
        </div>
      ))}
      <button style={addBtnStyle} onClick={() => onChange([...faqs, { q: "", a: "" }])}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}>
        + Add FAQ
      </button>
    </div>
  );
}

function ComparisonEditor({ data, onChange }: { data: ComparisonData; onChange: (d: ComparisonData) => void }) {
  const upd = <K extends keyof ComparisonData>(key: K, value: ComparisonData[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <div>
      {/* Tools */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>Tools Being Compared</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <ToolFields label="TOOL A" tool={data.tool_a} onChange={(t) => upd("tool_a", t)} accentColor="var(--accent)" />
          <ToolFields label="TOOL B" tool={data.tool_b} onChange={(t) => upd("tool_b", t)} accentColor="var(--accent2)" />
        </div>
      </div>

      {/* Quick Verdict */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>Quick Verdict</p>
        <Field label="Summary">
          <Textarea value={data.quick_verdict.summary} rows={3} placeholder="Overall summary of both tools…"
            onChange={(v) => upd("quick_verdict", { ...data.quick_verdict, summary: v })} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ ...labelStyle, color: "var(--accent)" }}>Choose {data.tool_a.name || "Tool A"} if…</label>
            <StringList items={data.quick_verdict.choose_a_if} placeholder="Bullet point…"
              onChange={(v) => upd("quick_verdict", { ...data.quick_verdict, choose_a_if: v })} />
          </div>
          <div>
            <label style={{ ...labelStyle, color: "var(--accent2)" }}>Choose {data.tool_b.name || "Tool B"} if…</label>
            <StringList items={data.quick_verdict.choose_b_if} placeholder="Bullet point…"
              onChange={(v) => upd("quick_verdict", { ...data.quick_verdict, choose_b_if: v })} />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>Comparison Table</p>
        <ComparisonTableEditor rows={data.comparison_table} onChange={(r) => upd("comparison_table", r)} />
      </div>

      {/* Content sections */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>Features</p>
        <RichTextEditor value={data.features_html} onChange={(v) => upd("features_html", v)} placeholder="Describe and compare the key features of both tools…" />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitle}>Pricing</p>
        <RichTextEditor value={data.pricing_html} onChange={(v) => upd("pricing_html", v)} placeholder="Compare pricing tiers, free plans, and value for money…" />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitle}>Ease of Use</p>
        <RichTextEditor value={data.ease_of_use_html} onChange={(v) => upd("ease_of_use_html", v)} placeholder="Compare onboarding, UI, and learning curves…" />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitle}>Performance</p>
        <RichTextEditor value={data.performance_html} onChange={(v) => upd("performance_html", v)} placeholder="Compare speed, accuracy, and reliability…" />
      </div>

      {/* Pros & Cons */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>Pros & Cons</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-space)", fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 10 }}>{data.tool_a.name || "Tool A"}</div>
            <label style={{ ...labelStyle, color: "var(--green)" }}>Pros</label>
            <StringList items={data.pros_a} placeholder="A strength…" onChange={(v) => upd("pros_a", v)} />
            <div style={{ marginTop: 12 }}>
              <label style={{ ...labelStyle, color: "var(--red)" }}>Cons</label>
              <StringList items={data.cons_a} placeholder="A weakness…" onChange={(v) => upd("cons_a", v)} />
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-space)", fontSize: 13, fontWeight: 700, color: "var(--accent2)", marginBottom: 10 }}>{data.tool_b.name || "Tool B"}</div>
            <label style={{ ...labelStyle, color: "var(--green)" }}>Pros</label>
            <StringList items={data.pros_b} placeholder="A strength…" onChange={(v) => upd("pros_b", v)} />
            <div style={{ marginTop: 12 }}>
              <label style={{ ...labelStyle, color: "var(--red)" }}>Cons</label>
              <StringList items={data.cons_b} placeholder="A weakness…" onChange={(v) => upd("cons_b", v)} />
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>Best Use Cases</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={{ ...labelStyle, color: "var(--accent)" }}>{data.tool_a.name || "Tool A"}</label>
            <StringList items={data.use_cases_a} placeholder="Use case…" onChange={(v) => upd("use_cases_a", v)} />
          </div>
          <div>
            <label style={{ ...labelStyle, color: "var(--accent2)" }}>{data.tool_b.name || "Tool B"}</label>
            <StringList items={data.use_cases_b} placeholder="Use case…" onChange={(v) => upd("use_cases_b", v)} />
          </div>
        </div>
      </div>

      {/* Final Verdict */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>Final Verdict</p>
        <RichTextEditor value={data.final_verdict_html} onChange={(v) => upd("final_verdict_html", v)} placeholder="Give your final recommendation and verdict…" />
      </div>

      {/* FAQs */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>FAQs</p>
        <FaqEditor faqs={data.faqs} onChange={(v) => upd("faqs", v)} />
      </div>
    </div>
  );
}

// ── Main BlogEditor ───────────────────────────────────────────────

function postUrl(slug: string, postType: string): string {
  if (postType === "comparison") return `/compare/${slug}`;
  if (postType === "best") return `/best/${slug}`;
  return `/blog/${slug}`;
}

type FormState = {
  title: string; slug: string; excerpt: string;
  category: string; read_time: string; cover_image_url: string;
  post_type: "article" | "listicle" | "comparison" | "best"; is_published: boolean;
  published_at: string; upvote_count: number;
  author_id: string;
  author_name: string; author_initials: string;
  author_role: string; author_bio: string;
  tags: string[]; related_tool_slug: string;
  richtext_body: string;
  intro_html: string;
  conclusion_html: string;
  body_blocks: BodyBlock[];
  list_items: ListItem[];
  focus_keyword: string;
  seo_title: string; seo_description: string; seo_og_image: string; canonical_url: string;
  comparison_data: ComparisonData;
};

function autoSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export default function BlogEditor({ post, authors = [] }: { post: BlogPostDetail | null; authors?: Author[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<"idle" | "saving" | "ok" | "error">("idle");

  // Separate richtext content from special blocks on load
  const existingBlocks = (post?.body_blocks ?? []) as BodyBlock[];
  const richtextBlock  = existingBlocks.find(b => b.type === "richtext") as { type: "richtext"; html: string } | undefined;
  const specialBlocks  = existingBlocks.filter(b => ["callout", "pullquote", "datapoints", "table", "toolcta"].includes(b.type));
  const initialRichtext = richtextBlock?.html ?? blocksToHtml(existingBlocks);

  const [form, setForm] = useState<FormState>({
    title:          post?.title          ?? "",
    slug:           post?.slug           ?? "",
    excerpt:        post?.excerpt         ?? "",
    category:       post?.category        ?? "Deep Dive",
    read_time:      post?.read_time        ?? "",
    cover_image_url: post?.cover_image_url ?? "",
    post_type:      (post?.post_type       ?? "article") as "article" | "listicle" | "comparison" | "best",
    is_published:   post?.is_published     ?? false,
    published_at:   post?.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    upvote_count:   post?.upvote_count     ?? 0,
    author_id:      (post as Record<string, unknown>)?.author_id      as string ?? "",
    author_name:    post?.author_name      ?? "",
    author_initials: post?.author_initials ?? "",
    author_role:    post?.author_role      ?? "",
    author_bio:     post?.author_bio       ?? "",
    tags:           post?.tags             ?? [],
    related_tool_slug: post?.related_tool_slug ?? "",
    richtext_body:  initialRichtext,
    intro_html:     (post as Record<string, unknown>)?.intro_html     as string ?? "",
    conclusion_html: (post as Record<string, unknown>)?.conclusion_html as string ?? "",
    body_blocks:    specialBlocks as BodyBlock[],
    list_items:     (post?.list_items      ?? []) as ListItem[],
    focus_keyword:   (post as Record<string, unknown>)?.focus_keyword   as string ?? "",
    seo_title:       (post as Record<string, unknown>)?.seo_title       as string ?? "",
    seo_description: (post as Record<string, unknown>)?.seo_description as string ?? "",
    seo_og_image:    (post as Record<string, unknown>)?.seo_og_image    as string ?? "",
    canonical_url:   (post as Record<string, unknown>)?.canonical_url   as string ?? "",
    comparison_data: ((post as Record<string, unknown>)?.comparison_data as ComparisonData | null | undefined) ?? defaultComparisonData(),
  });

  const upd = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    startTransition(async () => {
      setSaved("saving");
      try {
        // Combine richtext content + special blocks into body_blocks for storage
        const richtextHtml = addHeadingIds(form.richtext_body || "");
        const combinedBlocks: BodyBlock[] = [
          ...(richtextHtml ? [{ type: "richtext" as const, html: richtextHtml }] : []),
          ...form.body_blocks,
        ];
        // Build explicit DB payload — do NOT spread form (richtext_body is a virtual UI field, not a DB column)
        const payload: Record<string, unknown> = {
          title:           form.title,
          slug:            form.slug,
          excerpt:         form.excerpt,
          category:        form.category,
          read_time:       form.read_time,
          cover_image_url: form.cover_image_url || null,
          post_type:       form.post_type,
          is_published:    form.is_published,
          published_at:    form.published_at ? new Date(form.published_at).toISOString() : null,
          upvote_count:    Number(form.upvote_count),
          author_id:       form.author_id || null,
          author_name:     form.author_name,
          author_initials: form.author_initials,
          author_role:     form.author_role || null,
          author_bio:      form.author_bio || null,
          tags:            form.tags,
          related_tool_slug: form.related_tool_slug || null,
          body_blocks:     combinedBlocks,
          list_items:      form.list_items,
          intro_html:      form.intro_html || null,
          conclusion_html: form.conclusion_html || null,
          focus_keyword:   form.focus_keyword || null,
          seo_title:       form.seo_title || null,
          seo_description: form.seo_description || null,
          seo_og_image:    form.seo_og_image || null,
          canonical_url:   form.canonical_url || null,
          comparison_data: form.post_type === "comparison" ? form.comparison_data : null,
        };
        if (post) {
          await saveBlogPost(post.id, payload);
        } else {
          const created = await createBlogPost(payload);
          router.replace(`/admin/blog/${created.id}`);
        }
        setSaved("ok");
        setTimeout(() => setSaved("idle"), 3000);
      } catch {
        setSaved("error");
        setTimeout(() => setSaved("idle"), 4000);
      }
    });
  };

  const saveColors: Record<string, string> = {
    idle: "var(--accent)", saving: "var(--text3)", ok: "var(--green)", error: "var(--red)",
  };
  const saveLabels: Record<string, string> = {
    idle: post ? "Save Changes" : "Create Post",
    saving: "Saving…", ok: "Saved ✓", error: "Error — try again",
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 960, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
            {post ? `Edit: ${post.title.slice(0, 50)}${post.title.length > 50 ? "…" : ""}` : "New Blog Post"}
          </h1>
          {post && (
            <a href={postUrl(post.slug, form.post_type)} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: "var(--text3)", textDecoration: "none" }}>
              {postUrl(post.slug, form.post_type)} ↗
            </a>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => router.back()} style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid var(--border2)", color: "var(--text2)", background: "transparent", fontSize: 13, cursor: "pointer" }}>
            ← Back
          </button>
          <button onClick={handleSave} disabled={isPending}
            style={{ padding: "9px 20px", borderRadius: 9, background: saveColors[saved], border: "none", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "background 0.2s", minWidth: 130 }}>
            {saveLabels[saved]}
          </button>
        </div>
      </div>

      {/* ── Basic info ── */}
      <div style={sectionStyle}>
        <div style={{ ...sectionTitle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Basic Information</span>
          {post && (post as unknown as { updated_at?: string }).updated_at ? (
            <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}>
              Last saved: {new Date((post as unknown as { updated_at: string }).updated_at).toLocaleString()}
            </span>
          ) : null}
        </div>
        <Field label="Title">
          <Input value={form.title} placeholder="10 Best AI Writing Tools for 2026"
            onChange={(v) => { upd("title", v); if (!post) upd("slug", autoSlug(v)); }} />
        </Field>
        <Row>
          <Field label="Slug (URL)"><Input value={form.slug} placeholder="best-ai-writing-tools-2026" onChange={(v) => upd("slug", v)} /></Field>
          <Field label="Read time"><Input value={form.read_time} placeholder="8 min" onChange={(v) => upd("read_time", v)} /></Field>
        </Row>
        <Field label="Excerpt (shown on cards and as subtitle)">
          <Textarea value={form.excerpt} rows={3} placeholder="Short description shown in the blog listing…" onChange={(v) => upd("excerpt", v)} />
        </Field>
        <Row cols="1fr 1fr 1fr">
          <Field label="Category">
            <Select value={form.category} onChange={(v) => upd("category", v)}
              options={BLOG_CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </Field>
          <Field label="Post type → URL">
            <Select value={form.post_type} onChange={(v) => upd("post_type", v as FormState["post_type"])}
              options={[
                { value: "article",    label: "Article → /blog/slug" },
                { value: "listicle",   label: "Listicle (ranked list) → /blog/slug" },
                { value: "comparison", label: "Comparison (vs article) → /compare/slug" },
                { value: "best",       label: "Best For guide (ranked list) → /best/slug" },
              ]} />
          </Field>
          <Field label="Cover image (optional)">
            <ImageUpload value={form.cover_image_url} onChange={(v) => upd("cover_image_url", v)}
              folder="blog/covers" label="" />
          </Field>
        </Row>
      </div>

      {/* ── Publishing ── */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>Publishing</p>
        <div style={{ marginBottom: 20 }}>
          <Toggle label="Published (visible on site)" checked={form.is_published} onChange={(v) => upd("is_published", v)} />
        </div>
        <Row cols="1fr 1fr">
          <Field label="Published date &amp; time">
            <Input type="datetime-local" value={form.published_at} onChange={(v) => upd("published_at", v)} />
          </Field>
          <Field label="Upvote count">
            <Input type="number" value={form.upvote_count} onChange={(v) => upd("upvote_count", parseInt(v) || 0)} />
          </Field>
        </Row>
      </div>

      {/* ── Author ── */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>Author</p>

        {authors.length > 0 && (
          <div style={{ marginBottom: 20, padding: 14, background: "var(--bg3)", borderRadius: 10, border: "1px solid var(--border2)" }}>
            <label style={{ ...labelStyle, marginBottom: 8 }}>Select author (auto-fills fields below)</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select
                value={form.author_id}
                onChange={(e) => {
                  const id = e.target.value;
                  upd("author_id", id);
                  if (id) {
                    const a = authors.find((x) => x.id === id);
                    if (a) {
                      upd("author_name", a.name);
                      upd("author_initials", a.initials);
                      upd("author_role", a.role ?? "");
                      upd("author_bio", a.bio ?? "");
                    }
                  }
                }}
                style={{ ...{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)", color: "var(--text)", fontSize: 13, fontFamily: "var(--font-inter)", outline: "none", boxSizing: "border-box" as const }, cursor: "pointer", appearance: "none" as const }}
              >
                <option value="">— No author / manual entry —</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}{a.role ? ` · ${a.role}` : ""}</option>
                ))}
              </select>
              {form.author_id && (
                <button
                  onClick={() => {
                    const a = authors.find((x) => x.id === form.author_id);
                    if (a) {
                      upd("author_name", a.name);
                      upd("author_initials", a.initials);
                      upd("author_role", a.role ?? "");
                      upd("author_bio", a.bio ?? "");
                    }
                  }}
                  style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid var(--border2)", color: "var(--text2)", background: "transparent", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                  ↺ Sync
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, color: "var(--text3)", margin: "6px 0 0" }}>
              Fields below are saved on the post. Edit them to override the author profile for this post only.
            </p>
          </div>
        )}

        <Row cols="1fr 100px 1fr">
          <Field label="Author name"><Input value={form.author_name} placeholder="Sarah Chen" onChange={(v) => upd("author_name", v)} /></Field>
          <Field label="Initials"><Input value={form.author_initials} placeholder="SC" onChange={(v) => upd("author_initials", v.toUpperCase().slice(0, 2))} /></Field>
          <Field label="Author role"><Input value={form.author_role} placeholder="Senior AI Editor" onChange={(v) => upd("author_role", v)} /></Field>
        </Row>
        <Field label="Author bio (shown at bottom of post)">
          <Textarea value={form.author_bio} rows={3} placeholder="Short bio…" onChange={(v) => upd("author_bio", v)} />
        </Field>
      </div>

      {/* ── Tags & related ── */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>Tags & Related</p>
        <Field label="Tags">
          <StringList items={form.tags} onChange={(v) => upd("tags", v)} placeholder="e.g. AI Writing" />
        </Field>
        <Field label="Related tool slug (links a specific tool in the sidebar)">
          <Input value={form.related_tool_slug} placeholder="perplexity-ai" onChange={(v) => upd("related_tool_slug", v)} />
        </Field>
      </div>

      {/* ── Content (conditional on post_type) ── */}
      {form.post_type === "comparison" ? (
        <ComparisonEditor data={form.comparison_data} onChange={(d) => upd("comparison_data", d)} />
      ) : form.post_type === "article" ? (
        <>
          <div style={sectionStyle}>
            <p style={{ ...sectionTitle, marginBottom: 16 }}>Article Content</p>
            <p style={{ fontSize: 12, color: "var(--text3)", margin: "-8px 0 14px" }}>
              Use <strong style={{ color: "var(--text2)" }}>H2</strong> headings to generate the table of contents. Links, bold, italic, lists, blockquotes and more are all supported via the toolbar.
            </p>
            <RichTextEditor
              value={form.richtext_body}
              onChange={(v) => upd("richtext_body", v)}
            />
          </div>
          <div style={sectionStyle}>
            <p style={sectionTitle}>Special Blocks (optional)</p>
            <SpecialBlocksEditor blocks={form.body_blocks} onChange={(v) => upd("body_blocks", v)} />
          </div>
        </>
      ) : (
        <>
          {/* Intro */}
          <div style={sectionStyle}>
            <p style={{ ...sectionTitle, marginBottom: 16 }}>Introduction</p>
            <p style={{ fontSize: 12, color: "var(--text3)", margin: "-8px 0 14px" }}>
              Shown at the top of the listicle before the comparison table. Use it to hook the reader and explain your selection criteria.
            </p>
            <RichTextEditor
              value={form.intro_html}
              onChange={(v) => upd("intro_html", v)}
              placeholder="Write a compelling introduction to this listicle…"
              minHeight={160}
            />
          </div>

          {/* List items */}
          <div style={sectionStyle}>
            <p style={sectionTitle}>
              {form.post_type === "best" ? "Best For — Ranked Tool Items" : "Listicle Items"}
            </p>
            <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, marginTop: -12 }}>
              Each item is a ranked tool card. Ranks are auto-numbered by order — use arrows to reorder.
            </p>
            <ListItemsEditor items={form.list_items} onChange={(v) => upd("list_items", v)} />
          </div>

          {/* Conclusion */}
          <div style={sectionStyle}>
            <p style={{ ...sectionTitle, marginBottom: 16 }}>Conclusion</p>
            <p style={{ fontSize: 12, color: "var(--text3)", margin: "-8px 0 14px" }}>
              Shown after the ranked list. Summarize your findings, give a final recommendation, or link to related posts.
            </p>
            <RichTextEditor
              value={form.conclusion_html}
              onChange={(v) => upd("conclusion_html", v)}
              placeholder="Wrap up your listicle with a conclusion and final recommendation…"
              minHeight={160}
            />
          </div>
        </>
      )}

      {/* ── SEO ── */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>SEO</p>
        <p style={{ fontSize: 12, color: "var(--text3)", marginTop: -12, marginBottom: 16 }}>
          Leave blank to use auto-generated values (post title + excerpt).
        </p>
        <Field label="Meta title">
          <Input value={form.seo_title} onChange={(v) => upd("seo_title", v)}
            placeholder={`${form.title || "Post title"} — PromptBulletin`} />
          <p style={{ fontSize: 11, color: form.seo_title.length > 60 ? "#ef4444" : "var(--text3)", margin: "4px 0 0" }}>
            {form.seo_title.length}/60 characters
          </p>
        </Field>
        <Field label="Meta description">
          <Textarea value={form.seo_description} onChange={(v) => upd("seo_description", v)}
            placeholder={form.excerpt || "Short description for search results…"} rows={3} />
          <p style={{ fontSize: 11, color: form.seo_description.length > 160 ? "#ef4444" : "var(--text3)", margin: "4px 0 0" }}>
            {form.seo_description.length}/160 characters
          </p>
        </Field>
        <ImageUpload value={form.seo_og_image} onChange={(v) => upd("seo_og_image", v)}
          folder="blog/og" label="OG image (1200×630 recommended)" />
        <Field label="Focus keyword (primary search term)">
          <Input value={form.focus_keyword} onChange={(v) => upd("focus_keyword", v)}
            placeholder="e.g. best AI writing tools 2026" />
          <p style={{ fontSize: 11, color: "var(--text3)", margin: "4px 0 0" }}>
            The main keyword you want this post to rank for. Use it in the title, first paragraph, and H2s.
          </p>
        </Field>
        <Field label="Canonical URL override">
          <Input value={form.canonical_url} onChange={(v) => upd("canonical_url", v)}
            placeholder={`https://promptbulletin.com/blog/${form.slug || "post-slug"}`} />
          <p style={{ fontSize: 11, color: "var(--text3)", margin: "4px 0 0" }}>
            Leave blank to use the default URL. Set only if this post is syndicated from another source.
          </p>
        </Field>
      </div>

      {/* Sticky save */}
      <div style={{ position: "sticky", bottom: 24, display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={handleSave} disabled={isPending}
          style={{ padding: "11px 28px", borderRadius: 10, background: saveColors[saved], border: "none", color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "background 0.2s", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", minWidth: 150 }}>
          {saveLabels[saved]}
        </button>
      </div>
    </div>
  );
}
