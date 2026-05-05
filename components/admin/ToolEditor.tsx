"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveTool, createTool, saveReview, deleteReview } from "@/app/admin/actions";
import type { ToolDetail, ToolReview, ToolScore, ToolFeature, PricingTier, Screenshot } from "@/lib/queries";

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
const sectionTitleStyle: React.CSSProperties = {
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
  padding: "6px 10px", borderRadius: 7, border: "1px solid transparent",
  color: "var(--text3)", fontSize: 13, background: "transparent",
  cursor: "pointer", lineHeight: 1, flexShrink: 0,
};

// ── Field helpers ─────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Row({ children, cols = "1fr 1fr" }: { children: React.ReactNode; cols?: string }) {
  return <div style={{ display: "grid", gridTemplateColumns: cols, gap: 16, marginBottom: 16 }}>{children}</div>;
}

function StyledInput({ value, onChange, placeholder, type = "text" }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
  );
}

function StyledTextarea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} placeholder={placeholder} rows={rows} onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
  );
}

function StyledSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
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

// ── String array editor (pros, cons, best_for, platforms) ─────────
function StringListEditor({ items, onChange, placeholder }: {
  items: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <StyledInput value={item} placeholder={placeholder} onChange={(v) => {
            const next = [...items]; next[i] = v; onChange(next);
          }} />
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

// ── Scores editor ─────────────────────────────────────────────────
function ScoresEditor({ scores, onChange }: { scores: ToolScore[]; onChange: (v: ToolScore[]) => void }) {
  return (
    <div>
      {scores.map((s, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <StyledInput value={s.label} placeholder="Label (e.g. Accuracy)" onChange={(v) => {
            const next = [...scores]; next[i] = { ...next[i], label: v }; onChange(next);
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StyledInput type="number" value={s.score} placeholder="0-10" onChange={(v) => {
              const next = [...scores]; next[i] = { ...next[i], score: Math.min(10, Math.max(0, parseFloat(v) || 0)) }; onChange(next);
            }} />
          </div>
          <button style={removeBtnStyle} onClick={() => onChange(scores.filter((_, idx) => idx !== i))}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}>✕</button>
        </div>
      ))}
      <button style={addBtnStyle} onClick={() => onChange([...scores, { label: "", score: 8 }])}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}>
        + Add score
      </button>
    </div>
  );
}

// ── Screenshots editor ────────────────────────────────────────────
function ScreenshotsEditor({ shots, onChange }: { shots: Screenshot[]; onChange: (v: Screenshot[]) => void }) {
  return (
    <div>
      {shots.map((s, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <StyledInput value={s.url} placeholder="https://..." onChange={(v) => {
            const next = [...shots]; next[i] = { ...next[i], url: v }; onChange(next);
          }} />
          <StyledInput value={s.caption} placeholder="Caption" onChange={(v) => {
            const next = [...shots]; next[i] = { ...next[i], caption: v }; onChange(next);
          }} />
          <button style={removeBtnStyle} onClick={() => onChange(shots.filter((_, idx) => idx !== i))}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}>✕</button>
        </div>
      ))}
      <button style={addBtnStyle} onClick={() => onChange([...shots, { url: "", caption: "" }])}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}>
        + Add screenshot
      </button>
    </div>
  );
}

// ── Feature table editor ──────────────────────────────────────────
function FeaturesEditor({ features, onChange }: { features: ToolFeature[]; onChange: (v: ToolFeature[]) => void }) {
  const includedOptions = [
    { value: "true",       label: "All tiers (Free + Pro + Enterprise)" },
    { value: "Pro",        label: "Pro + Enterprise only" },
    { value: "Enterprise", label: "Enterprise only" },
    { value: "false",      label: "Not included" },
  ];
  return (
    <div>
      {features.map((f, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 200px auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <StyledInput value={f.name} placeholder="Feature name" onChange={(v) => {
            const next = [...features]; next[i] = { ...next[i], name: v }; onChange(next);
          }} />
          <StyledSelect
            value={String(f.included)}
            onChange={(v) => {
              const next = [...features];
              const val = v === "true" ? true : v === "false" ? false : v;
              next[i] = { ...next[i], included: val };
              onChange(next);
            }}
            options={includedOptions}
          />
          <button style={removeBtnStyle} onClick={() => onChange(features.filter((_, idx) => idx !== i))}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}>✕</button>
        </div>
      ))}
      <button style={addBtnStyle} onClick={() => onChange([...features, { name: "", included: true }])}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}>
        + Add feature
      </button>
    </div>
  );
}

// ── Pricing tiers editor ──────────────────────────────────────────
function PricingEditor({ tiers, onChange }: { tiers: PricingTier[]; onChange: (v: PricingTier[]) => void }) {
  const updateTier = (i: number, key: keyof PricingTier, value: unknown) => {
    const next = [...tiers]; next[i] = { ...next[i], [key]: value }; onChange(next);
  };
  const addFeature = (ti: number) => {
    const next = [...tiers]; next[ti] = { ...next[ti], features: [...next[ti].features, ""] }; onChange(next);
  };
  const removeFeature = (ti: number, fi: number) => {
    const next = [...tiers]; next[ti] = { ...next[ti], features: next[ti].features.filter((_, idx) => idx !== fi) }; onChange(next);
  };
  const updateFeature = (ti: number, fi: number, v: string) => {
    const next = [...tiers]; const feats = [...next[ti].features]; feats[fi] = v; next[ti] = { ...next[ti], features: feats }; onChange(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {tiers.map((tier, i) => (
        <div key={i} style={{ border: `1px solid ${tier.highlight ? "var(--accent)" : "var(--border)"}`, borderRadius: 12, padding: 16, position: "relative" }}>
          {tier.highlight && <div style={{ position: "absolute", top: -1, left: 0, right: 0, height: 2, background: "var(--accent)", borderRadius: "12px 12px 0 0" }} />}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: tier.highlight ? "var(--accent)" : "var(--text2)" }}>Tier {i + 1}</span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Toggle label="Popular" checked={tier.highlight} onChange={(v) => updateTier(i, "highlight", v)} />
              <button style={{ ...removeBtnStyle, fontSize: 12 }} onClick={() => onChange(tiers.filter((_, idx) => idx !== i))}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}>Remove tier</button>
            </div>
          </div>
          <Row cols="1fr 1fr 1fr">
            <div><label style={labelStyle}>Name</label><StyledInput value={tier.name} placeholder="Free" onChange={(v) => updateTier(i, "name", v)} /></div>
            <div><label style={labelStyle}>Price</label><StyledInput value={tier.price} placeholder="$0" onChange={(v) => updateTier(i, "price", v)} /></div>
            <div><label style={labelStyle}>Period</label><StyledInput value={tier.period} placeholder="per month" onChange={(v) => updateTier(i, "period", v)} /></div>
          </Row>
          <label style={labelStyle}>Features</label>
          {tier.features.map((feat, fi) => (
            <div key={fi} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <StyledInput value={feat} placeholder="Feature description" onChange={(v) => updateFeature(i, fi, v)} />
              <button style={removeBtnStyle} onClick={() => removeFeature(i, fi)}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}>✕</button>
            </div>
          ))}
          <button style={addBtnStyle} onClick={() => addFeature(i)}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}>
            + Add feature
          </button>
        </div>
      ))}
      <button style={addBtnStyle} onClick={() => onChange([...tiers, { name: "", price: "", period: "per month", highlight: false, features: [] }])}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}>
        + Add pricing tier
      </button>
    </div>
  );
}

// ── Reviews panel ─────────────────────────────────────────────────
function ReviewsPanel({ toolId, initialReviews }: { toolId: string; initialReviews: ToolReview[] }) {
  const [reviews, setReviews]   = useState<ToolReview[]>(initialReviews);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [isPending, startTransition] = useTransition();

  const emptyForm = { author_name: "", author_initials: "", role: "", rating: 5, date_text: "", review_text: "", helpful_count: 0 };
  const [addForm, setAddForm] = useState(emptyForm);
  const [editForms, setEditForms] = useState<Record<string, Partial<ToolReview>>>({});

  const handleAdd = () => {
    startTransition(async () => {
      await saveReview({ ...addForm, tool_id: toolId });
      const temp = { ...addForm, id: Date.now().toString(), tool_id: toolId } as ToolReview;
      setReviews((r) => [temp, ...r]);
      setAddForm(emptyForm);
      setShowAdd(false);
    });
  };

  const handleSaveEdit = (id: string) => {
    startTransition(async () => {
      const data = editForms[id];
      await saveReview({ id, ...data });
      setReviews((r) => r.map((rev) => rev.id === id ? { ...rev, ...data } : rev));
      setEditingId(null);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this review?")) return;
    startTransition(async () => {
      await deleteReview(id);
      setReviews((r) => r.filter((rev) => rev.id !== id));
    });
  };

  const startEdit = (review: ToolReview) => {
    setEditingId(review.id);
    setEditForms((f) => ({ ...f, [review.id]: { ...review } }));
  };

  const ReviewForm = ({ values, onChange, onSave, onCancel }: {
    values: typeof emptyForm | Partial<ToolReview>;
    onChange: (k: string, v: unknown) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div style={{ padding: 16, background: "var(--bg3)", borderRadius: 10, border: "1px solid var(--border2)", marginBottom: 12 }}>
      <Row cols="1fr 1fr 1fr 80px">
        <div><label style={labelStyle}>Name</label><StyledInput value={String(values.author_name ?? "")} onChange={(v) => onChange("author_name", v)} placeholder="John Doe" /></div>
        <div><label style={labelStyle}>Initials</label><StyledInput value={String(values.author_initials ?? "")} onChange={(v) => onChange("author_initials", v.toUpperCase().slice(0, 2))} placeholder="JD" /></div>
        <div><label style={labelStyle}>Role</label><StyledInput value={String(values.role ?? "")} onChange={(v) => onChange("role", v)} placeholder="Product Manager" /></div>
        <div><label style={labelStyle}>Rating</label>
          <StyledSelect value={String(values.rating ?? 5)} onChange={(v) => onChange("rating", parseInt(v))}
            options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: "★".repeat(n) }))} /></div>
      </Row>
      <Row cols="1fr 140px">
        <div><label style={labelStyle}>Review text</label><StyledTextarea value={String(values.review_text ?? "")} onChange={(v) => onChange("review_text", v)} rows={3} /></div>
        <div>
          <div><label style={labelStyle}>Date shown</label><StyledInput value={String(values.date_text ?? "")} onChange={(v) => onChange("date_text", v)} placeholder="Jan 15, 2026" /></div>
          <div style={{ marginTop: 10 }}><label style={labelStyle}>Helpful count</label><StyledInput type="number" value={String(values.helpful_count ?? 0)} onChange={(v) => onChange("helpful_count", parseInt(v) || 0)} /></div>
        </div>
      </Row>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid var(--border2)", color: "var(--text2)", background: "transparent", fontSize: 12, cursor: "pointer" }}>Cancel</button>
        <button onClick={onSave} disabled={isPending} style={{ padding: "7px 14px", borderRadius: 7, background: "var(--accent)", border: "none", color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Save</button>
      </div>
    </div>
  );

  return (
    <div style={sectionStyle}>
      <div style={{ ...sectionTitleStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Community Reviews ({reviews.length})</span>
        <button onClick={() => setShowAdd(!showAdd)} style={{ padding: "6px 14px", borderRadius: 7, background: showAdd ? "var(--bg3)" : "var(--accent)", border: "none", color: showAdd ? "var(--text2)" : "#000", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
          {showAdd ? "Cancel" : "+ Add Review"}
        </button>
      </div>

      {showAdd && (
        <ReviewForm
          values={addForm}
          onChange={(k, v) => setAddForm((f) => ({ ...f, [k]: v }))}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {reviews.length === 0 && !showAdd && (
        <p style={{ fontSize: 13, color: "var(--text3)", textAlign: "center", padding: "20px 0" }}>No reviews yet.</p>
      )}

      {reviews.map((review) => (
        <div key={review.id}>
          {editingId === review.id ? (
            <ReviewForm
              values={editForms[review.id] ?? review}
              onChange={(k, v) => setEditForms((f) => ({ ...f, [review.id]: { ...f[review.id], [k]: v } }))}
              onSave={() => handleSaveEdit(review.id)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 10, marginBottom: 8, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "start" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--accent-dim)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>{review.author_initials}</span>
              </div>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{review.author_name}</span>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>{review.role}</span>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>{review.date_text}</span>
                  <span style={{ color: "var(--accent)", fontSize: 11 }}>{"★".repeat(review.rating)}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text2)", margin: 0, lineHeight: 1.6 }}>{review.review_text}</p>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>👍 {review.helpful_count} helpful</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => startEdit(review)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border2)", color: "var(--text2)", fontSize: 11, background: "transparent", cursor: "pointer" }}>Edit</button>
                <button onClick={() => handleDelete(review.id)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid transparent", color: "var(--text3)", fontSize: 11, background: "transparent", cursor: "pointer" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--red)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text3)"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}>Del</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main ToolEditor component ─────────────────────────────────────
type Category = { id: string; name: string; slug: string };

type FormState = {
  name: string; slug: string; tagline: string; description: string;
  category_id: string; pricing: string; website_url: string;
  link_rel: string; platforms: string[]; is_published: boolean;
  badge: string; tag: string; tag_type: string;
  rating: number; editor_rating: number; upvote_count: number; review_count: number;
  company: string; founded: string; summary: string;
  best_for: string[]; pros: string[]; cons: string[];
  scores: ToolScore[]; screenshots: Screenshot[];
  pricing_tiers: PricingTier[]; tool_features: ToolFeature[];
  seo_title: string; seo_description: string; seo_og_image: string;
};

const PLATFORMS = ["Web", "iOS", "Android", "Mac", "Win", "Linux", "API", "Discord"];

export default function ToolEditor({
  tool, categories, reviews,
}: {
  tool: ToolDetail | null;
  categories: Category[];
  reviews: ToolReview[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<"idle" | "saving" | "ok" | "error">("idle");

  const [form, setForm] = useState<FormState>({
    name:          tool?.name          ?? "",
    slug:          tool?.slug          ?? "",
    tagline:       tool?.tagline       ?? "",
    description:   tool?.description   ?? "",
    category_id:   tool?.category_id   ?? "",
    pricing:       tool?.pricing       ?? "",
    website_url:   tool?.website_url   ?? "",
    link_rel:      tool?.link_rel      ?? "nofollow",
    platforms:     tool?.platforms     ?? [],
    is_published:  tool?.is_published  ?? false,
    badge:         tool?.badge         ?? "",
    tag:           tool?.tag           ?? "",
    tag_type:      tool?.tag_type      ?? "",
    rating:        tool?.rating        ?? 0,
    editor_rating: tool?.editor_rating ?? 0,
    upvote_count:  tool?.upvote_count  ?? 0,
    review_count:  tool?.review_count  ?? 0,
    company:       tool?.company       ?? "",
    founded:       tool?.founded       ?? "",
    summary:       tool?.summary       ?? "",
    best_for:      tool?.best_for      ?? [],
    pros:          tool?.pros          ?? [],
    cons:          tool?.cons          ?? [],
    scores:        tool?.scores        ?? [],
    screenshots:   tool?.screenshots   ?? [],
    pricing_tiers: tool?.pricing_tiers ?? [],
    tool_features: tool?.tool_features ?? [],
    seo_title:       (tool as Record<string, unknown>)?.seo_title       as string ?? "",
    seo_description: (tool as Record<string, unknown>)?.seo_description as string ?? "",
    seo_og_image:    (tool as Record<string, unknown>)?.seo_og_image    as string ?? "",
  });

  const upd = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const togglePlatform = (p: string) =>
    upd("platforms", form.platforms.includes(p)
      ? form.platforms.filter((x) => x !== p)
      : [...form.platforms, p]);

  const handleSave = () => {
    startTransition(async () => {
      setSaved("saving");
      try {
        const payload = {
          ...form,
          badge:    form.badge    || null,
          tag:      form.tag      || null,
          tag_type: form.tag_type || null,
          rating:   Number(form.rating),
          editor_rating: Number(form.editor_rating),
          upvote_count:  Number(form.upvote_count),
          review_count:  Number(form.review_count),
        };
        if (tool) {
          await saveTool(tool.id, payload);
        } else {
          const created = await createTool(payload);
          router.replace(`/admin/tools/${created.id}`);
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
    idle: tool ? "Save Changes" : "Create Tool",
    saving: "Saving…",
    ok: "Saved ✓",
    error: "Error — try again",
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 960, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
            {tool ? `Edit: ${tool.name}` : "New Tool"}
          </h1>
          {tool && (
            <a href={`/tools/${tool.slug}`} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: "var(--text3)", textDecoration: "none" }}>
              /tools/{tool.slug} ↗
            </a>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => router.back()} style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid var(--border2)", color: "var(--text2)", background: "transparent", fontSize: 13, cursor: "pointer" }}>
            ← Back
          </button>
          <button onClick={handleSave} disabled={isPending}
            style={{ padding: "9px 20px", borderRadius: 9, background: saveColors[saved], border: "none", color: saved === "idle" || saved === "saving" ? (saved === "idle" ? "#000" : "var(--bg)") : "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "background 0.2s", minWidth: 130 }}>
            {saveLabels[saved]}
          </button>
        </div>
      </div>

      {/* ── Section: Basic Info ── */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Basic Information</p>
        <Row>
          <Field label="Tool Name">
            <StyledInput value={form.name} onChange={(v) => { upd("name", v); if (!tool) upd("slug", autoSlug(v)); }} placeholder="e.g. Perplexity AI" />
          </Field>
          <Field label="Slug (URL)">
            <StyledInput value={form.slug} onChange={(v) => upd("slug", v)} placeholder="e.g. perplexity-ai" />
          </Field>
        </Row>
        <Field label="Tagline (short)">
          <StyledInput value={form.tagline} onChange={(v) => upd("tagline", v)} placeholder="The AI answer engine for the web" />
        </Field>
        <Field label="Description (card text)">
          <StyledTextarea value={form.description} onChange={(v) => upd("description", v)} rows={3} placeholder="Shown on tool cards…" />
        </Field>
        <Row>
          <Field label="Category">
            <StyledSelect value={form.category_id} onChange={(v) => upd("category_id", v)}
              options={[{ value: "", label: "— Select category —" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} />
          </Field>
          <Field label="Pricing display">
            <StyledInput value={form.pricing} onChange={(v) => upd("pricing", v)} placeholder="Free / $20mo" />
          </Field>
        </Row>
      </div>

      {/* ── Section: Visit Link ── */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Visit Link</p>
        <Field label="Website URL">
          <StyledInput value={form.website_url} onChange={(v) => upd("website_url", v)} placeholder="https://example.com" />
        </Field>
        <Field label="Link relationship">
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { value: "nofollow",  label: "Nofollow",  desc: "No SEO credit passed (default)" },
              { value: "dofollow",  label: "Dofollow",  desc: "Passes SEO link equity" },
              { value: "sponsored", label: "Sponsored", desc: "Paid/affiliate link" },
            ].map((opt) => (
              <label key={opt.value} style={{ display: "flex", gap: 8, cursor: "pointer", alignItems: "flex-start" }}>
                <input type="radio" name="link_rel" value={opt.value} checked={form.link_rel === opt.value}
                  onChange={() => upd("link_rel", opt.value as FormState["link_rel"])}
                  style={{ marginTop: 3, accentColor: "var(--accent)" }} />
                <span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block" }}>{opt.label}</span>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </Field>
      </div>

      {/* ── Section: Publishing ── */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Publishing & Meta</p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
          <Toggle label="Published (visible on site)" checked={form.is_published} onChange={(v) => upd("is_published", v)} />
        </div>
        <Row cols="1fr 1fr 1fr">
          <Field label="Badge">
            <StyledSelect value={form.badge} onChange={(v) => upd("badge", v)}
              options={[{ value: "", label: "None" }, { value: "Trending", label: "Trending" }, { value: "Hot", label: "Hot" }, { value: "New", label: "New" }]} />
          </Field>
          <Field label="Tag label (e.g. Editor's Choice)">
            <StyledInput value={form.tag} onChange={(v) => upd("tag", v)} placeholder="Editor's Choice" />
          </Field>
          <Field label="Tag type">
            <StyledSelect value={form.tag_type} onChange={(v) => upd("tag_type", v)}
              options={[{ value: "", label: "None" }, { value: "editor", label: "editor" }, { value: "top", label: "top" }]} />
          </Field>
        </Row>
        <Field label="Platforms">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PLATFORMS.map((p) => (
              <button key={p} onClick={() => togglePlatform(p)} style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                background: form.platforms.includes(p) ? "var(--accent-dim)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${form.platforms.includes(p) ? "var(--accent)" : "var(--border)"}`,
                color: form.platforms.includes(p) ? "var(--accent)" : "var(--text2)",
              }}>{p}</button>
            ))}
          </div>
        </Field>
      </div>

      {/* ── Section: Stats & Company ── */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Stats & Company</p>
        <Row cols="1fr 1fr 1fr 1fr">
          <Field label="Rating (0–5)"><StyledInput type="number" value={form.rating} onChange={(v) => upd("rating", parseFloat(v) || 0)} /></Field>
          <Field label="Editor Rating (0–10)"><StyledInput type="number" value={form.editor_rating} onChange={(v) => upd("editor_rating", parseFloat(v) || 0)} /></Field>
          <Field label="Upvote Count"><StyledInput type="number" value={form.upvote_count} onChange={(v) => upd("upvote_count", parseInt(v) || 0)} /></Field>
          <Field label="Review Count"><StyledInput type="number" value={form.review_count} onChange={(v) => upd("review_count", parseInt(v) || 0)} /></Field>
        </Row>
        <Row>
          <Field label="Company Name"><StyledInput value={form.company} onChange={(v) => upd("company", v)} placeholder="Perplexity AI, Inc." /></Field>
          <Field label="Founded Year"><StyledInput value={form.founded} onChange={(v) => upd("founded", v)} placeholder="2022" /></Field>
        </Row>
      </div>

      {/* ── Section: Content ── */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Overview Content</p>
        <Field label="Summary (full article text, separate paragraphs with blank line)">
          <StyledTextarea value={form.summary} onChange={(v) => upd("summary", v)} rows={6} placeholder="Full overview text shown on the tool page…" />
        </Field>
        <Field label="Best For (audience tags)">
          <StringListEditor items={form.best_for} onChange={(v) => upd("best_for", v)} placeholder="e.g. Marketers" />
        </Field>
      </div>

      {/* ── Section: Pros / Cons ── */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Pros & Cons</p>
        <Row>
          <div>
            <label style={{ ...labelStyle, color: "var(--green)" }}>Pros</label>
            <StringListEditor items={form.pros} onChange={(v) => upd("pros", v)} placeholder="A strength…" />
          </div>
          <div>
            <label style={{ ...labelStyle, color: "var(--red)" }}>Cons</label>
            <StringListEditor items={form.cons} onChange={(v) => upd("cons", v)} placeholder="A weakness…" />
          </div>
        </Row>
      </div>

      {/* ── Section: Editorial Scores ── */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Editorial Scores</p>
        <ScoresEditor scores={form.scores} onChange={(v) => upd("scores", v)} />
      </div>

      {/* ── Section: Screenshots ── */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Screenshots</p>
        <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, marginTop: -12 }}>Add public image URLs. They appear in the gallery on the tool page.</p>
        <ScreenshotsEditor shots={form.screenshots} onChange={(v) => upd("screenshots", v)} />
      </div>

      {/* ── Section: Pricing Tiers ── */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Pricing Tiers</p>
        <PricingEditor tiers={form.pricing_tiers} onChange={(v) => upd("pricing_tiers", v)} />
      </div>

      {/* ── Section: Feature Table ── */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Feature Table</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px auto", gap: 8, marginBottom: 8, padding: "0 8px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Feature Name</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Available In</span>
          <span />
        </div>
        <FeaturesEditor features={form.tool_features} onChange={(v) => upd("tool_features", v)} />
      </div>

      {/* ── Section: Reviews ── */}
      {tool && <ReviewsPanel toolId={tool.id} initialReviews={reviews} />}

      {/* ── Section: SEO ── */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>SEO</p>
        <p style={{ fontSize: 12, color: "var(--text3)", marginTop: -12, marginBottom: 16 }}>
          Leave blank to use auto-generated values (tool name + tagline).
        </p>
        <Field label="Meta title">
          <StyledInput value={form.seo_title} onChange={(v) => upd("seo_title", v)}
            placeholder={`${form.name} Review — PromptBulletin`} />
          <p style={{ fontSize: 11, color: form.seo_title.length > 60 ? "#ef4444" : "var(--text3)", margin: "4px 0 0" }}>
            {form.seo_title.length}/60 characters
          </p>
        </Field>
        <Field label="Meta description">
          <StyledTextarea value={form.seo_description} onChange={(v) => upd("seo_description", v)}
            placeholder={form.tagline || "Short description for search results…"} rows={3} />
          <p style={{ fontSize: 11, color: form.seo_description.length > 160 ? "#ef4444" : "var(--text3)", margin: "4px 0 0" }}>
            {form.seo_description.length}/160 characters
          </p>
        </Field>
        <Field label="OG image URL">
          <StyledInput value={form.seo_og_image} onChange={(v) => upd("seo_og_image", v)}
            placeholder="https://…/og-image.png (1200×630 recommended)" />
        </Field>
        {form.seo_og_image && (
          <img src={form.seo_og_image} alt="OG preview"
            style={{ maxWidth: 320, borderRadius: 8, border: "1px solid var(--border)", marginTop: 8 }} />
        )}
      </div>

      {/* Sticky bottom save */}
      <div style={{ position: "sticky", bottom: 24, display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={handleSave} disabled={isPending}
          style={{ padding: "11px 28px", borderRadius: 10, background: saveColors[saved], border: "none", color: saved === "idle" ? "#000" : (saved === "saving" ? "var(--bg)" : "#000"), fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "background 0.2s", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", minWidth: 150 }}>
          {saveLabels[saved]}
        </button>
      </div>
    </div>
  );
}
