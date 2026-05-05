"use client";
import { useState, useTransition } from "react";
import { saveSiteConfig } from "@/app/admin/actions";
import type { SeoSystemConfig } from "@/lib/site-config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)",
  color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--text3)",
  textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5,
};

type Props = {
  seoSystem: SeoSystemConfig;
  toolCount: number;
  blogCount: number;
};

export default function SEOPanel({ seoSystem, toolCount, blogCount }: Props) {
  const [tab, setTab] = useState<"sitemap" | "robots" | "global">("sitemap");
  const [cfg, setCfg] = useState<SeoSystemConfig>(seoSystem);
  const [newPath, setNewPath] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  const totalUrls = 2 + toolCount + blogCount; // static + tools + posts

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    startTransition(async () => {
      try {
        await saveSiteConfig("seo_system", cfg as unknown as Record<string, unknown>);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } finally {
        setSaving(false);
      }
    });
  };

  const addPath = () => {
    const p = newPath.trim();
    if (!p || cfg.noindexPaths.includes(p)) return;
    setCfg((c) => ({ ...c, noindexPaths: [...c.noindexPaths, p] }));
    setNewPath("");
  };

  const removePath = (p: string) =>
    setCfg((c) => ({ ...c, noindexPaths: c.noindexPaths.filter((x) => x !== p) }));

  const tabs = [
    { id: "sitemap" as const, label: "Sitemap" },
    { id: "robots"  as const, label: "Robots & Noindex" },
    { id: "global"  as const, label: "Global SEO" },
  ];

  return (
    <div style={{ maxWidth: 860, padding: "40px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-space)", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
          SEO
        </h1>
        <p style={{ fontSize: 13, color: "var(--text3)", margin: "4px 0 0" }}>
          Manage sitemap, meta tags, and crawl settings
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg3)", padding: 4, borderRadius: 10, width: "fit-content" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "8px 20px", borderRadius: 7, border: "none", cursor: "pointer",
              background: tab === t.id ? "var(--bg2)" : "transparent",
              color: tab === t.id ? "var(--text)" : "var(--text2)",
              fontWeight: tab === t.id ? 600 : 400, fontSize: 13,
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Sitemap tab ── */}
      {tab === "sitemap" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Total URLs",   value: totalUrls },
              { label: "Static pages", value: 2 },
              { label: "Tool pages",   value: toolCount },
              { label: "Blog pages",   value: blogCount },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-space)" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Sitemap file</p>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12, lineHeight: 1.6 }}>
              Your sitemap is auto-generated and live at <code style={{ background: "var(--bg3)", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>/sitemap.xml</code>. It updates automatically whenever tools or blog posts are published. No manual action needed.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"
                style={{ padding: "8px 16px", borderRadius: 8, background: "var(--accent)", color: "#000", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                View sitemap.xml ↗
              </a>
              <a href="https://search.google.com/search-console/sitemaps" target="_blank" rel="noopener noreferrer"
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border2)", color: "var(--text2)", fontSize: 13, textDecoration: "none" }}>
                Submit to Google ↗
              </a>
            </div>
          </div>

          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Included pages</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { path: "/",     type: "Static",  freq: "Daily",   priority: "1.0" },
                { path: "/blog", type: "Static",  freq: "Daily",   priority: "0.9" },
                { path: "/tools/[slug]", type: `${toolCount} tools`, freq: "Weekly", priority: "0.8" },
                { path: "/blog/[slug]",  type: `${blogCount} posts`, freq: "Monthly", priority: "0.7" },
              ].map((row) => (
                <div key={row.path} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 60px", gap: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", fontSize: 12 }}>
                  <code style={{ color: "var(--accent)" }}>{row.path}</code>
                  <span style={{ color: "var(--text3)" }}>{row.type}</span>
                  <span style={{ color: "var(--text3)" }}>{row.freq}</span>
                  <span style={{ color: "var(--text3)", textAlign: "right" }}>{row.priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Robots tab ── */}
      {tab === "robots" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Always blocked (hardcoded)</p>
            <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>These paths are always disallowed in robots.txt and noindexed. You cannot remove them.</p>
            {["/admin", "/admin/"].map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#ef4444" }}>✕ Blocked</span>
                <code style={{ fontSize: 12, color: "var(--text2)", flex: 1 }}>{p}</code>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>Hardcoded</span>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Custom noindex paths</p>
            <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, lineHeight: 1.6 }}>
              Add paths you want excluded from search engines. These appear as <code style={{ background: "var(--bg3)", padding: "1px 5px", borderRadius: 3 }}>Disallow</code> rules in <code style={{ background: "var(--bg3)", padding: "1px 5px", borderRadius: 3 }}>/robots.txt</code>.
            </p>

            {cfg.noindexPaths.length > 0 ? (
              <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {cfg.noindexPaths.map((p) => (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>✕</span>
                    <code style={{ fontSize: 12, color: "var(--text2)", flex: 1 }}>{p}</code>
                    <button onClick={() => removePath(p)}
                      style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 11 }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 12 }}>No custom paths added yet.</p>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <input value={newPath} onChange={(e) => setNewPath(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPath()}
                placeholder="/secret-page or /internal/*"
                style={{ ...inp, flex: 1 }} />
              <button onClick={addPath}
                style={{ padding: "9px 16px", borderRadius: 8, background: "var(--accent)", color: "#000", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                + Add path
              </button>
            </div>
          </div>

          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>robots.txt preview</p>
            <pre style={{ background: "var(--bg3)", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "var(--text2)", overflow: "auto", lineHeight: 1.8, margin: 0 }}>
{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin${cfg.noindexPaths.map((p) => `\nDisallow: ${p}`).join("")}

Sitemap: ${SITE_URL}/sitemap.xml`}
            </pre>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer"
                style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border2)", color: "var(--text2)", fontSize: 12, textDecoration: "none" }}>
                View live robots.txt ↗
              </a>
            </div>
          </div>

          <SaveBar onSave={handleSave} saving={saving} saved={saved} />
        </div>
      )}

      {/* ── Global SEO tab ── */}
      {tab === "global" && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 28px" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Default OG image URL</label>
            <p style={{ fontSize: 11, color: "var(--text3)", margin: "0 0 6px" }}>
              Used as fallback when a tool or post has no custom OG image. 1200×630px recommended.
            </p>
            <input value={cfg.siteOgImage} onChange={(e) => setCfg((c) => ({ ...c, siteOgImage: e.target.value }))}
              placeholder="https://…/og-default.png" style={inp} />
            {cfg.siteOgImage && (
              <img src={cfg.siteOgImage} alt="OG preview"
                style={{ maxWidth: 360, borderRadius: 8, border: "1px solid var(--border)", marginTop: 10 }} />
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Twitter / X handle</label>
            <p style={{ fontSize: 11, color: "var(--text3)", margin: "0 0 6px" }}>Used in twitter:site meta tag. Include the @.</p>
            <input value={cfg.twitterHandle} onChange={(e) => setCfg((c) => ({ ...c, twitterHandle: e.target.value }))}
              placeholder="@promptbulletin" style={inp} />
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 8 }}>
            <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text)" }}>Per-content SEO fields</strong> are edited directly inside each tool and blog post editor — look for the SEO section at the bottom of the editor.
            </p>
          </div>

          <SaveBar onSave={handleSave} saving={saving} saved={saved} />
        </div>
      )}
    </div>
  );
}

function SaveBar({ onSave, saving, saved }: { onSave: () => void; saving: boolean; saved: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid var(--border)", marginTop: 8 }}>
      <button onClick={onSave} disabled={saving}
        style={{ padding: "9px 24px", borderRadius: 9, background: "var(--accent)", color: "#000", fontWeight: 700, fontSize: 13, border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
        {saving ? "Saving…" : "Save changes"}
      </button>
      {saved && !saving && <span style={{ fontSize: 12, color: "var(--green)" }}>✓ Saved — live on site</span>}
    </div>
  );
}
