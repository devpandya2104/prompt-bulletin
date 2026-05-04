"use client";
import React, { useState, useTransition } from "react";
import { saveSiteConfig } from "@/app/admin/actions";
import type { NavbarConfig, FooterConfig } from "@/lib/site-config";

// ── Shared styles ──────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)",
  color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--text3)",
  textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5,
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={lbl}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: "var(--text3)", margin: "0 0 6px" }}>{hint}</p>}
      {children}
    </div>
  );
}

function SaveBar({ onSave, saving, saved, error }: { onSave: () => void; saving: boolean; saved: boolean; error: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid var(--border)", marginTop: 8 }}>
      <button onClick={onSave} disabled={saving}
        style={{ padding: "9px 24px", borderRadius: 9, background: "var(--accent)", color: "#000", fontWeight: 700, fontSize: 13, border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
        {saving ? "Saving…" : "Save changes"}
      </button>
      {saved && !saving && <span style={{ fontSize: 12, color: "var(--green)" }}>✓ Saved — live on site</span>}
      {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
    </div>
  );
}

// ── Navbar editor ──────────────────────────────────────────────────────────
function NavbarEditor({ config, onChange }: { config: NavbarConfig; onChange: (v: NavbarConfig) => void }) {
  const updLink = (i: number, k: "label" | "href", v: string) =>
    onChange({ ...config, links: config.links.map((x, j) => j === i ? { ...x, [k]: v } : x) });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <Field label="Logo / site name" hint="Large CamelCase split: first part is default color, last word gets accent color (e.g. PromptBulletin → Prompt + Bulletin)">
        <input value={config.logoName} onChange={(e) => onChange({ ...config, logoName: e.target.value })} style={inp} placeholder="PromptBulletin" />
      </Field>

      <Field label="Navigation links" hint="Last link in the list is styled as a CTA with accent border">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {config.links.map((link, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--text3)", width: 20, textAlign: "center", flexShrink: 0 }}>{i + 1}</span>
              <input value={link.label} onChange={(e) => updLink(i, "label", e.target.value)}
                style={{ ...inp, width: 140 }} placeholder="Label" />
              <input value={link.href} onChange={(e) => updLink(i, "href", e.target.value)}
                style={{ ...inp, flex: 1 }} placeholder="/path or /#anchor" />
              {/* Move up / down */}
              <button onClick={() => { if (i === 0) return; const arr = [...config.links]; [arr[i-1], arr[i]] = [arr[i], arr[i-1]]; onChange({ ...config, links: arr }); }}
                style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text3)", cursor: "pointer", fontSize: 11 }} title="Move up">↑</button>
              <button onClick={() => { if (i === config.links.length - 1) return; const arr = [...config.links]; [arr[i+1], arr[i]] = [arr[i], arr[i+1]]; onChange({ ...config, links: arr }); }}
                style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text3)", cursor: "pointer", fontSize: 11 }} title="Move down">↓</button>
              <button onClick={() => onChange({ ...config, links: config.links.filter((_, j) => j !== i) })}
                style={{ padding: "0 8px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--red)", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
          ))}
        </div>
        <button onClick={() => onChange({ ...config, links: [...config.links, { label: "", href: "" }] })}
          style={{ marginTop: 8, fontSize: 12, color: "var(--accent)", background: "transparent", border: "1px solid var(--accent-dim)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
          + Add link
        </button>
      </Field>

      {/* Live preview */}
      <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", marginTop: 8 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Preview</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#000" }}>
              {config.logoName[0]}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-space)", color: "var(--text)" }}>
              {config.logoName.split(/(?=[A-Z])/).length > 1 ? (
                <>
                  {config.logoName.split(/(?=[A-Z])/).slice(0, -1).join("")}
                  <span style={{ color: "var(--accent)" }}>{config.logoName.split(/(?=[A-Z])/).slice(-1)[0]}</span>
                </>
              ) : config.logoName}
            </span>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {config.links.map((l, i) => (
              <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, color: i === config.links.length - 1 ? "var(--accent)" : "var(--text3)", border: i === config.links.length - 1 ? "1px solid var(--accent-dim)" : "1px solid transparent" }}>
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Footer editor ──────────────────────────────────────────────────────────
function FooterEditor({ config, onChange }: { config: FooterConfig; onChange: (v: FooterConfig) => void }) {
  const updColLink = (ci: number, li: number, k: "label" | "href", v: string) =>
    onChange({
      ...config,
      columns: config.columns.map((col, cj) => cj !== ci ? col : {
        ...col,
        links: col.links.map((lk, lj) => lj === li ? { ...lk, [k]: v } : lk),
      }),
    });

  const updLegal = (i: number, k: "label" | "href", v: string) =>
    onChange({ ...config, legalLinks: config.legalLinks.map((l, j) => j === i ? { ...l, [k]: v } : l) });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <Field label="Company tagline">
        <textarea value={config.description} onChange={(e) => onChange({ ...config, description: e.target.value })}
          style={{ ...inp, resize: "vertical", minHeight: 72, lineHeight: 1.6 }} />
      </Field>

      <Field label="Link columns" hint="Each column has a heading and a list of links">
        {config.columns.map((col, ci) => (
          <div key={ci} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
              <input value={col.title} onChange={(e) => onChange({ ...config, columns: config.columns.map((c, j) => j === ci ? { ...c, title: e.target.value } : c) })}
                style={{ ...inp, fontWeight: 600 }} placeholder="Column heading" />
              <button onClick={() => onChange({ ...config, columns: config.columns.filter((_, j) => j !== ci) })}
                style={{ padding: "0 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--red)", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
            {col.links.map((lk, li) => (
              <div key={li} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <input value={lk.label} onChange={(e) => updColLink(ci, li, "label", e.target.value)}
                  style={{ ...inp, flex: 1 }} placeholder="Link label" />
                <input value={lk.href} onChange={(e) => updColLink(ci, li, "href", e.target.value)}
                  style={{ ...inp, flex: 1 }} placeholder="/path or #" />
                <button onClick={() => onChange({ ...config, columns: config.columns.map((c, cj) => cj !== ci ? c : { ...c, links: c.links.filter((_, lj) => lj !== li) }) })}
                  style={{ padding: "0 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--red)", cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
            ))}
            <button onClick={() => onChange({ ...config, columns: config.columns.map((c, cj) => cj !== ci ? c : { ...c, links: [...c.links, { label: "", href: "#" }] }) })}
              style={{ fontSize: 12, color: "var(--accent)", background: "transparent", border: "1px solid var(--accent-dim)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
              + Add link
            </button>
          </div>
        ))}
        <button onClick={() => onChange({ ...config, columns: [...config.columns, { title: "New Column", links: [] }] })}
          style={{ fontSize: 12, color: "var(--accent)", background: "transparent", border: "1px solid var(--accent-dim)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
          + Add column
        </button>
      </Field>

      <Field label="Copyright text">
        <input value={config.copyright} onChange={(e) => onChange({ ...config, copyright: e.target.value })} style={inp} />
      </Field>

      <Field label="Legal links (Privacy, Terms, etc.)">
        {config.legalLinks.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input value={l.label} onChange={(e) => updLegal(i, "label", e.target.value)}
              style={{ ...inp, width: 120 }} placeholder="Label" />
            <input value={l.href} onChange={(e) => updLegal(i, "href", e.target.value)}
              style={{ ...inp, flex: 1 }} placeholder="/path or #" />
            <button onClick={() => onChange({ ...config, legalLinks: config.legalLinks.filter((_, j) => j !== i) })}
              style={{ padding: "0 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--red)", cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        ))}
        <button onClick={() => onChange({ ...config, legalLinks: [...config.legalLinks, { label: "", href: "#" }] })}
          style={{ fontSize: 12, color: "var(--accent)", background: "transparent", border: "1px solid var(--accent-dim)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
          + Add link
        </button>
      </Field>
    </div>
  );
}

// ── Root component ──────────────────────────────────────────────────────────
export default function HeaderFooterEditor({
  navbar: initialNavbar,
  footer: initialFooter,
}: {
  navbar: NavbarConfig;
  footer: FooterConfig;
}) {
  const [activeTab, setActiveTab] = useState<"navbar" | "footer">("navbar");
  const [navbar,    setNavbar]    = useState<NavbarConfig>(initialNavbar);
  const [footer,    setFooter]    = useState<FooterConfig>(initialFooter);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [, startTransition] = useTransition();

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    setError("");
    startTransition(async () => {
      try {
        if (activeTab === "navbar") {
          await saveSiteConfig("navbar", navbar as unknown as Record<string, unknown>);
        } else {
          await saveSiteConfig("footer", footer as unknown as Record<string, unknown>);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Save failed");
      } finally {
        setSaving(false);
      }
    });
  };

  const tabs = [
    { id: "navbar" as const, label: "Navbar", icon: "🔝" },
    { id: "footer" as const, label: "Footer", icon: "🦶" },
  ];

  return (
    <div style={{ maxWidth: 800, padding: "40px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-space)", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
          Header & Footer
        </h1>
        <p style={{ fontSize: 13, color: "var(--text3)", margin: "4px 0 0" }}>Edit navigation links, logo, and footer content</p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg3)", padding: 4, borderRadius: 10, width: "fit-content" }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSaved(false); setError(""); }}
            style={{
              padding: "8px 20px", borderRadius: 7, border: "none", cursor: "pointer",
              background: activeTab === tab.id ? "var(--bg2)" : "transparent",
              color: activeTab === tab.id ? "var(--text)" : "var(--text2)",
              fontWeight: activeTab === tab.id ? 600 : 400, fontSize: 13,
              boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 28px" }}>
        {activeTab === "navbar" ? (
          <NavbarEditor config={navbar} onChange={setNavbar} />
        ) : (
          <FooterEditor config={footer} onChange={setFooter} />
        )}
        <SaveBar onSave={handleSave} saving={saving} saved={saved} error={error} />
      </div>
    </div>
  );
}
