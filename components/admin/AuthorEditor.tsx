"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAuthor, createAuthor, deleteAuthor } from "@/app/admin/actions";
import ImageUpload from "./ImageUpload";
import type { Author } from "@/lib/queries";

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function autoInitials(name: string) {
  return name.split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2);
}

export default function AuthorEditor({ author }: { author: Author | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    name:       author?.name       ?? "",
    initials:   author?.initials   ?? "",
    role:       author?.role       ?? "",
    bio:        author?.bio        ?? "",
    avatar_url: author?.avatar_url ?? "",
    sort_order: author?.sort_order ?? 0,
  });

  const upd = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSave = () => {
    startTransition(async () => {
      setSaved("saving");
      try {
        if (author) {
          await saveAuthor(author.id, form);
        } else {
          const created = await createAuthor(form);
          router.replace(`/admin/authors/${created.id}`);
        }
        setSaved("ok");
        setTimeout(() => setSaved("idle"), 2500);
      } catch {
        setSaved("error");
        setTimeout(() => setSaved("idle"), 4000);
      }
    });
  };

  const handleDelete = () => {
    if (!author) return;
    startTransition(async () => {
      await deleteAuthor(author.id);
      router.push("/admin/authors");
    });
  };

  const saveColors = { idle: "var(--accent)", saving: "var(--text3)", ok: "var(--green)", error: "var(--red)" };
  const saveLabels = { idle: author ? "Save Changes" : "Create Author", saving: "Saving…", ok: "Saved ✓", error: "Error" };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>
            {author ? `Edit: ${author.name}` : "New Author"}
          </h1>
          <p style={{ fontSize: 12, color: "var(--text3)", margin: "4px 0 0" }}>
            Authors are shared across all blog posts — create once, select anywhere.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => router.back()} style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid var(--border2)", color: "var(--text2)", background: "transparent", fontSize: 13, cursor: "pointer" }}>
            ← Back
          </button>
          <button onClick={handleSave} disabled={isPending}
            style={{ padding: "9px 20px", borderRadius: 9, background: saveColors[saved], border: "none", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", minWidth: 130 }}>
            {saveLabels[saved]}
          </button>
        </div>
      </div>

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <p style={{ fontFamily: "var(--font-space)", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          Author Details
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, marginBottom: 16 }}>
          <div>
            <Field label="Full name">
              <input value={form.name} placeholder="Sarah Chen"
                onChange={(e) => { upd("name", e.target.value); if (!form.initials || form.initials === autoInitials(form.name)) upd("initials", autoInitials(e.target.value)); }}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12 }}>
              <Field label="Initials">
                <input value={form.initials} placeholder="SC" maxLength={2}
                  onChange={(e) => upd("initials", e.target.value.toUpperCase().slice(0, 2))}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
              </Field>
              <Field label="Role / Title">
                <input value={form.role} placeholder="Senior AI Editor"
                  onChange={(e) => upd("role", e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
              </Field>
            </div>
          </div>

          {/* Avatar preview */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--bg3)", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {form.avatar_url ? (
                <img src={form.avatar_url} alt={form.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>
                  {form.initials || "?"}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, color: "var(--text3)", textAlign: "center" }}>Preview</span>
          </div>
        </div>

        <Field label="Bio (shown at bottom of articles)">
          <textarea value={form.bio} placeholder="Sarah covers AI productivity tools and has been testing writing assistants for 3+ years. Previously at The Verge."
            rows={4}
            onChange={(e) => upd("bio", e.target.value)}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
        </Field>

        <ImageUpload value={form.avatar_url} onChange={(v) => upd("avatar_url", v)}
          folder="authors/avatars" label="Avatar photo (square, min 200×200)" />

        <Field label="Sort order (lower = appears first in dropdown)">
          <input type="number" value={form.sort_order}
            onChange={(e) => upd("sort_order", parseInt(e.target.value) || 0)}
            style={{ ...inputStyle, width: 100 }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
        </Field>
      </div>

      {/* Danger zone */}
      {author && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--red)", borderRadius: 14, padding: 20 }}>
          <p style={{ fontFamily: "var(--font-space)", fontSize: 13, fontWeight: 700, color: "var(--red)", marginBottom: 10 }}>
            Danger Zone
          </p>
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14 }}>
            Deleting this author sets all their blog posts to "no author". This cannot be undone.
          </p>
          {confirmDelete ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDelete} disabled={isPending}
                style={{ padding: "8px 16px", borderRadius: 8, background: "var(--red)", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Yes, delete permanently
              </button>
              <button onClick={() => setConfirmDelete(false)}
                style={{ padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px solid var(--border2)", color: "var(--text2)", fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: "1px solid var(--red)", color: "var(--red)", fontSize: 13, cursor: "pointer" }}>
              Delete author…
            </button>
          )}
        </div>
      )}
    </div>
  );
}
