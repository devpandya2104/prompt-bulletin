"use client";
import { useState, useTransition, useEffect } from "react";
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
  articleCount: number;
  comparisonCount: number;
  bestCount: number;
};

export default function SEOPanel({ seoSystem, toolCount, articleCount, comparisonCount, bestCount }: Props) {
  const [tab, setTab] = useState<"sitemap" | "robots" | "global">("sitemap");
  const [cfg, setCfg] = useState<SeoSystemConfig>(seoSystem);
  const [newPath, setNewPath] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();
  const [liveRobots, setLiveRobots] = useState<string | null>(null);
  const [loadingRobots, setLoadingRobots] = useState(false);

  useEffect(() => {
    if (tab === "robots" && liveRobots === null) {
      setLoadingRobots(true);
      fetch("/robots.txt")
        .then((r) => r.text())
        .then((text) => { setLiveRobots(text); setLoadingRobots(false); })
        .catch(() => { setLiveRobots("(failed to load)"); setLoadingRobots(false); });
    }
  }, [tab, liveRobots]);

  const STATIC_PAGES = 4; // /, /blog, /compare, /best
  const totalUrls = STATIC_PAGES + toolCount + articleCount + comparisonCount + bestCount;

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[
              { label: "Total URLs",   value: totalUrls },
              { label: "Static pages", value: STATIC_PAGES },
              { label: "Tool pages",   value: toolCount },
              { label: "Articles",     value: articleCount },
              { label: "Comparisons",  value: comparisonCount },
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
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Included pages</p>
            </div>
            <p style={{ fontSize: 12, color: "var(--text3)", margin: "0 0 14px", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text2)" }}>Priority</strong> is a hint to search engines (0.0–1.0) about which pages matter most on your site. It does <em>not</em> affect your ranking — it just tells crawlers where to spend their crawl budget first.
            </p>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 80px 60px", gap: 12, padding: "6px 12px", fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
              <span>Path</span><span>Count</span><span>Frequency</span><span style={{ textAlign: "right" }}>Priority</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {[
                { path: "/",                 count: "Static",                     freq: "Daily",   priority: "1.0", color: "var(--accent)" },
                { path: "/blog",             count: "Static",                     freq: "Daily",   priority: "0.9", color: "var(--accent)" },
                { path: "/compare",          count: "Static",                     freq: "Weekly",  priority: "0.85", color: "var(--accent)" },
                { path: "/best",             count: "Static",                     freq: "Weekly",  priority: "0.85", color: "var(--accent)" },
                { path: "/tools/[slug]",     count: `${toolCount} tools`,          freq: "Weekly",  priority: "0.8",  color: "var(--accent2)" },
                { path: "/compare/[slug]",   count: `${comparisonCount} posts`,    freq: "Monthly", priority: "0.75", color: "var(--green)" },
                { path: "/best/[slug]",      count: `${bestCount} posts`,          freq: "Monthly", priority: "0.75", color: "var(--green)" },
                { path: "/blog/[slug]",      count: `${articleCount} posts`,       freq: "Monthly", priority: "0.7",  color: "var(--accent2)" },
              ].map((row) => (
                <div key={row.path} style={{ display: "grid", gridTemplateColumns: "1fr 110px 80px 60px", gap: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", fontSize: 12 }}>
                  <code style={{ color: row.color }}>{row.path}</code>
                  <span style={{ color: "var(--text3)" }}>{row.count}</span>
                  <span style={{ color: "var(--text3)" }}>{row.freq}</span>
                  <span style={{ color: "var(--text3)", textAlign: "right", fontFamily: "var(--font-space)", fontWeight: 600 }}>{row.priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Robots tab ── */}
      {tab === "robots" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Live preview */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                  Live robots.txt
                  <span style={{ marginLeft: 8, display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--green)", verticalAlign: "middle" }} />
                </p>
                <p style={{ fontSize: 12, color: "var(--text3)", margin: "3px 0 0" }}>
                  Fetched live from <code style={{ background: "var(--bg3)", padding: "1px 5px", borderRadius: 3 }}>/robots.txt</code>
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setLiveRobots(null); setLoadingRobots(true); fetch("/robots.txt").then(r => r.text()).then(t => { setLiveRobots(t); setLoadingRobots(false); }).catch(() => { setLiveRobots("(failed to load)"); setLoadingRobots(false); }); }}
                  style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border2)", background: "transparent", color: "var(--text2)", fontSize: 12, cursor: "pointer" }}>
                  ↺ Refresh
                </button>
                <a href="/robots.txt" target="_blank" rel="noopener noreferrer"
                  style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--accent)", color: "var(--accent)", fontSize: 12, textDecoration: "none", fontWeight: 600 }}>
                  Open ↗
                </a>
              </div>
            </div>
            <pre style={{
              background: "var(--bg3)", borderRadius: 8, padding: "14px 16px",
              fontSize: 12, color: "var(--text2)", overflow: "auto", lineHeight: 1.85,
              margin: 0, minHeight: 120, fontFamily: "monospace",
              borderLeft: "3px solid var(--accent)",
            }}>
              {loadingRobots ? (
                <span style={{ color: "var(--text3)" }}>Loading…</span>
              ) : (
                (liveRobots ?? "").split("\n").map((line, i) => {
                  const isComment = line.trim().startsWith("#");
                  const isDisallow = line.startsWith("Disallow");
                  const isAllow = line.startsWith("Allow");
                  const isSignal = line.startsWith("Content-Signal");
                  const isSitemap = line.startsWith("Sitemap");
                  const color = isComment ? "var(--text3)"
                    : isDisallow ? "oklch(65% 0.2 25)"
                    : isAllow ? "var(--green)"
                    : isSignal ? "var(--accent2)"
                    : isSitemap ? "var(--accent)"
                    : "var(--text2)";
                  return <span key={i} style={{ color, display: "block" }}>{line || " "}</span>;
                })
              )}
            </pre>
          </div>

          {/* Info about the file */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>About the Content-Signal header</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { signal: "search=yes",    label: "Search indexing", desc: "Allows Google, Bing etc. to index and show snippets" },
                { signal: "ai-input=yes",  label: "AI answers",      desc: "Allows ChatGPT, Perplexity etc. to cite your content" },
                { signal: "ai-train=yes",  label: "AI training",     desc: "Allows AI companies to use your content for training" },
              ].map((row) => (
                <div key={row.signal} style={{ display: "grid", gridTemplateColumns: "120px 140px 1fr", gap: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", fontSize: 12, alignItems: "center" }}>
                  <code style={{ color: "var(--accent2)" }}>{row.signal}</code>
                  <span style={{ color: "var(--text)", fontWeight: 500 }}>{row.label}</span>
                  <span style={{ color: "var(--text3)" }}>{row.desc}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--text3)", margin: "12px 0 0", lineHeight: 1.6 }}>
              To change these settings, edit <code style={{ background: "var(--bg3)", padding: "1px 5px", borderRadius: 3 }}>public/robots.txt</code> in the codebase and redeploy.
            </p>
          </div>

          {/* Blocked paths */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Blocked paths</p>
            <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>These paths are disallowed in robots.txt. Edit the file to add more.</p>
            {["/admin/", "/admin"].map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#ef4444" }}>✕</span>
                <code style={{ fontSize: 12, color: "var(--text2)", flex: 1 }}>{p}</code>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>Disallowed</span>
              </div>
            ))}
          </div>

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
