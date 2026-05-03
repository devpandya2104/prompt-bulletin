"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBlogPost, createBlogPost } from "@/app/admin/actions";
import type { BlogPostDetail, BodyBlock, ListItem } from "@/lib/queries";

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

// ── Body block editor ─────────────────────────────────────────────
type BlockType = BodyBlock["type"];

const BLOCK_TYPES: { value: BlockType; label: string }[] = [
  { value: "h2",         label: "Heading (H2)" },
  { value: "p",          label: "Paragraph" },
  { value: "callout",    label: "Callout box" },
  { value: "pullquote",  label: "Pull quote" },
  { value: "datapoints", label: "Data points grid" },
  { value: "table",      label: "Comparison table" },
  { value: "toolcta",    label: "Tool CTA" },
];

function newBlock(type: BlockType): BodyBlock {
  switch (type) {
    case "h2":         return { type, id: "", text: "" };
    case "p":          return { type, text: "" };
    case "callout":    return { type, variant: "info", title: "", text: "" };
    case "pullquote":  return { type, text: "" };
    case "datapoints": return { type, items: [{ value: "", label: "" }] };
    case "table":      return { type, headers: ["Feature", "Value"], rows: [["", ""]] };
    case "toolcta":    return { type, tool_name: "", tool_slug: "", cta_text: "" };
  }
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
  const typeLabel = BLOCK_TYPES.find((t) => t.value === block.type)?.label ?? block.type;

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
        {block.type === "h2" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 10 }}>
            <div>
              <label style={labelStyle}>Heading text</label>
              <Input value={block.text} placeholder="Section heading…"
                onChange={(v) => onChange({ ...block, text: v, id: block.id || autoId(v) })} />
            </div>
            <div>
              <label style={labelStyle}>Anchor ID</label>
              <Input value={block.id} placeholder="auto-from-text"
                onChange={(v) => onChange({ ...block, id: v })} />
            </div>
          </div>
        )}

        {block.type === "p" && (
          <>
            <label style={labelStyle}>Paragraph text</label>
            <Textarea value={block.text} placeholder="Write paragraph…" rows={4}
              onChange={(v) => onChange({ ...block, text: v })} />
          </>
        )}

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

function BodyBlocksEditor({ blocks, onChange }: { blocks: BodyBlock[]; onChange: (v: BodyBlock[]) => void }) {
  const [addType, setAddType] = useState<BlockType>("p");

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...blocks];
    const swap = idx + dir;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  };

  return (
    <div>
      {blocks.map((block, i) => (
        <BlockCard key={i} block={block} idx={i} total={blocks.length}
          onChange={(b) => { const next = [...blocks]; next[i] = b; onChange(next); }}
          onRemove={() => onChange(blocks.filter((_, idx) => idx !== i))}
          onMove={(dir) => move(i, dir)} />
      ))}

      {/* Add block row */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
        <Select value={addType} onChange={(v) => setAddType(v as BlockType)} options={BLOCK_TYPES} />
        <button
          onClick={() => onChange([...blocks, newBlock(addType)])}
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
          <label style={labelStyle}>Description (Lora serif paragraph shown under the verdict)</label>
          <Textarea value={item.description} rows={3} placeholder="Describe this tool's position in the list…"
            onChange={(v) => onChange({ ...item, description: v })} />
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

// ── Main BlogEditor ───────────────────────────────────────────────
const CATEGORIES = ["Deep Dive", "Roundup", "Guide", "News", "Opinion"];

type FormState = {
  title: string; slug: string; excerpt: string;
  category: string; read_time: string; cover_image_url: string;
  post_type: "article" | "listicle"; is_published: boolean;
  published_at: string; upvote_count: number;
  author_name: string; author_initials: string;
  author_role: string; author_bio: string;
  tags: string[]; related_tool_slug: string;
  body_blocks: BodyBlock[]; list_items: ListItem[];
};

function autoSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export default function BlogEditor({ post }: { post: BlogPostDetail | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<"idle" | "saving" | "ok" | "error">("idle");

  const [form, setForm] = useState<FormState>({
    title:          post?.title          ?? "",
    slug:           post?.slug           ?? "",
    excerpt:        post?.excerpt         ?? "",
    category:       post?.category        ?? "Deep Dive",
    read_time:      post?.read_time        ?? "",
    cover_image_url: post?.cover_image_url ?? "",
    post_type:      (post?.post_type       ?? "article") as "article" | "listicle",
    is_published:   post?.is_published     ?? false,
    published_at:   post?.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    upvote_count:   post?.upvote_count     ?? 0,
    author_name:    post?.author_name      ?? "",
    author_initials: post?.author_initials ?? "",
    author_role:    post?.author_role      ?? "",
    author_bio:     post?.author_bio       ?? "",
    tags:           post?.tags             ?? [],
    related_tool_slug: post?.related_tool_slug ?? "",
    body_blocks:    (post?.body_blocks     ?? []) as BodyBlock[],
    list_items:     (post?.list_items      ?? []) as ListItem[],
  });

  const upd = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    startTransition(async () => {
      setSaved("saving");
      try {
        const payload = {
          ...form,
          published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
          upvote_count: Number(form.upvote_count),
          related_tool_slug: form.related_tool_slug || null,
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
            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: "var(--text3)", textDecoration: "none" }}>
              /blog/{post.slug} ↗
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
        <p style={sectionTitle}>Basic Information</p>
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
              options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </Field>
          <Field label="Post type">
            <Select value={form.post_type} onChange={(v) => upd("post_type", v as "article" | "listicle")}
              options={[{ value: "article", label: "Article (TOC + body blocks)" }, { value: "listicle", label: "Listicle (ranked tool list)" }]} />
          </Field>
          <Field label="Cover image URL (optional)">
            <Input value={form.cover_image_url} placeholder="https://…" onChange={(v) => upd("cover_image_url", v)} />
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
      {form.post_type === "article" ? (
        <div style={sectionStyle}>
          <p style={sectionTitle}>Article Body Blocks</p>
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, marginTop: -12 }}>
            Each block maps to a section rendered in the article. Use H2 blocks to generate the table of contents. Order matters — use arrows to reorder.
          </p>
          <BodyBlocksEditor blocks={form.body_blocks} onChange={(v) => upd("body_blocks", v)} />
        </div>
      ) : (
        <div style={sectionStyle}>
          <p style={sectionTitle}>Listicle Items</p>
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, marginTop: -12 }}>
            Each item is a ranked tool card. Ranks are auto-numbered by order — drag (use arrows) to reorder and ranks update automatically.
          </p>
          <ListItemsEditor items={form.list_items} onChange={(v) => upd("list_items", v)} />
        </div>
      )}

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
