"use client";
import { useState, useTransition } from "react";
import { saveCategory, createCategory, deleteCategory } from "@/app/admin/actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  sort_order: number;
  tool_count: number;
};

type FormState = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  sort_order: number;
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)",
  color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--text3)",
  textTransform: "uppercase", letterSpacing: "0.08em",
  display: "block", marginBottom: 5,
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const EMPTY_FORM: FormState = { name: "", slug: "", icon: "🔧", description: "", sort_order: 0 };

function CategoryForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormState;
  onSave: (data: FormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const upd = (k: keyof FormState, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 1fr 80px", gap: 12, alignItems: "end" }}>
      <div>
        <label style={labelStyle}>Name</label>
        <input
          style={inputStyle}
          value={form.name}
          placeholder="e.g. AI Writing"
          onChange={(e) => {
            upd("name", e.target.value);
            upd("slug", slugify(e.target.value));
          }}
        />
      </div>
      <div>
        <label style={labelStyle}>Slug</label>
        <input
          style={inputStyle}
          value={form.slug}
          placeholder="ai-writing"
          onChange={(e) => upd("slug", e.target.value)}
        />
      </div>
      <div>
        <label style={labelStyle}>Icon</label>
        <input
          style={{ ...inputStyle, textAlign: "center", fontSize: 20 }}
          value={form.icon}
          placeholder="🔧"
          onChange={(e) => upd("icon", e.target.value)}
        />
      </div>
      <div>
        <label style={labelStyle}>Description</label>
        <input
          style={inputStyle}
          value={form.description}
          placeholder="Short description (optional)"
          onChange={(e) => upd("description", e.target.value)}
        />
      </div>
      <div>
        <label style={labelStyle}>Order</label>
        <input
          type="number"
          style={inputStyle}
          value={form.sort_order}
          min={0}
          onChange={(e) => upd("sort_order", Number(e.target.value))}
        />
      </div>
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button onClick={onCancel} style={{
          padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border2)",
          color: "var(--text2)", background: "transparent", fontSize: 13, cursor: "pointer",
        }}>Cancel</button>
        <button
          onClick={() => onSave(form)}
          disabled={!form.name || !form.slug || saving}
          style={{
            padding: "8px 20px", borderRadius: 8, background: "var(--accent)",
            color: "#000", fontWeight: 700, fontSize: 13, border: "none",
            cursor: form.name && form.slug ? "pointer" : "not-allowed",
            opacity: form.name && form.slug ? 1 : 0.5,
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function CategoriesManager({ categories: initial }: { categories: Category[] }) {
  const [list, setList] = useState<Category[]>(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = (form: FormState) => {
    setSaving(true);
    setError(null);
    startTransition(async () => {
      try {
        const cat = await createCategory({
          name: form.name,
          slug: form.slug,
          icon: form.icon || "🔧",
          description: form.description || null,
          sort_order: form.sort_order,
        });
        setList((prev) => [...prev, { ...form, id: cat.id, tool_count: 0, description: form.description || null }]);
        setAdding(false);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to create category");
      } finally {
        setSaving(false);
      }
    });
  };

  const handleSave = (id: string, form: FormState) => {
    setSaving(true);
    setError(null);
    startTransition(async () => {
      try {
        await saveCategory(id, {
          name: form.name,
          slug: form.slug,
          icon: form.icon || "🔧",
          description: form.description || null,
          sort_order: form.sort_order,
        });
        setList((prev) => prev.map((c) => c.id === id ? { ...c, ...form, description: form.description || null } : c));
        setEditingId(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to save category");
      } finally {
        setSaving(false);
      }
    });
  };

  const handleDelete = (id: string, name: string, toolCount: number) => {
    const msg = toolCount > 0
      ? `"${name}" has ${toolCount} tool${toolCount > 1 ? "s" : ""} in it. Deleting will unassign those tools. Continue?`
      : `Delete "${name}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      await deleteCategory(id);
      setList((prev) => prev.filter((c) => c.id !== id));
    });
  };

  return (
    <div>
      {/* Add new category */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14,
        padding: 20, marginBottom: 20,
      }}>
        {adding ? (
          <CategoryForm
            initial={EMPTY_FORM}
            onSave={handleCreate}
            onCancel={() => setAdding(false)}
            saving={saving}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 9, background: "var(--accent)",
              color: "#000", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer",
            }}
          >
            + Add Category
          </button>
        )}
        {error && (
          <p style={{ marginTop: 12, fontSize: 13, color: "var(--red)" }}>{error}</p>
        )}
      </div>

      {/* Categories list */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "48px 1fr 160px 80px 80px 140px",
          background: "var(--bg3)", padding: "10px 20px", borderBottom: "1px solid var(--border)",
          gap: 12,
        }}>
          {["Icon", "Name / Slug", "Description", "Order", "Tools", ""].map((h) => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {h}
            </span>
          ))}
        </div>

        {list.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text3)" }}>No categories yet. Add your first one above.</p>
          </div>
        )}

        {list.map((cat, i) => (
          <div key={cat.id}>
            {editingId === cat.id ? (
              <div style={{
                padding: "16px 20px",
                background: "rgba(255,255,255,0.02)",
                borderBottom: i < list.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <CategoryForm
                  initial={{
                    name: cat.name,
                    slug: cat.slug,
                    icon: cat.icon,
                    description: cat.description ?? "",
                    sort_order: cat.sort_order,
                  }}
                  onSave={(form) => handleSave(cat.id, form)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              </div>
            ) : (
              <div style={{
                display: "grid", gridTemplateColumns: "48px 1fr 160px 80px 80px 140px",
                padding: "14px 20px", alignItems: "center", gap: 12,
                borderBottom: i < list.length - 1 ? "1px solid var(--border)" : "none",
                background: i % 2 === 0 ? "var(--bg2)" : "transparent",
              }}>
                <span style={{ fontSize: 22, textAlign: "center" }}>{cat.icon}</span>

                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{cat.slug}</div>
                </div>

                <span style={{ fontSize: 12, color: "var(--text2)" }}>
                  {cat.description ?? <span style={{ color: "var(--text3)" }}>—</span>}
                </span>

                <span style={{ fontSize: 13, color: "var(--text2)", textAlign: "center" }}>{cat.sort_order}</span>

                <span style={{
                  fontSize: 12, fontWeight: 600, textAlign: "center",
                  color: cat.tool_count > 0 ? "var(--accent)" : "var(--text3)",
                }}>
                  {cat.tool_count}
                </span>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setEditingId(cat.id)}
                    style={{
                      padding: "5px 12px", borderRadius: 7, border: "1px solid var(--border2)",
                      color: "var(--text2)", fontSize: 12, fontWeight: 500, background: "transparent", cursor: "pointer",
                    }}
                  >Edit</button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name, cat.tool_count)}
                    style={{
                      padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)",
                      color: "var(--text3)", fontSize: 12, background: "transparent", cursor: "pointer",
                    }}
                  >Del</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
