"use client";
import React, { useState, useTransition } from "react";
import { saveSiteConfig } from "@/app/admin/actions";
import type { SiteConfig } from "@/lib/site-config";

// ── Shared UI primitives ──────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)",
  color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--text3)",
  textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5,
};
const card: React.CSSProperties = {
  background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 10,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 14 }}><label style={lbl}>{label}</label>{children}</div>;
}
function Input({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean }) {
  return (
    <Field label={label}>
      {textarea
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            style={{ ...inp, resize: "vertical", minHeight: 80, lineHeight: 1.6 }} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inp} />}
    </Field>
  );
}

function StringListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <Field label={label}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input value={item} onChange={(e) => onChange(items.map((x, j) => j === i ? e.target.value : x))} style={{ ...inp, flex: 1 }} />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))}
            style={{ padding: "0 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--red)", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])}
        style={{ fontSize: 12, color: "var(--accent)", background: "transparent", border: "1px solid var(--accent-dim)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
        + Add
      </button>
    </Field>
  );
}

function StatEditor({ stats, onChange }: { stats: { value: string; label: string }[]; onChange: (v: { value: string; label: string }[]) => void }) {
  return (
    <Field label="Stats">
      {stats.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
          <input value={s.value} onChange={(e) => onChange(stats.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
            placeholder="Value" style={{ ...inp, width: 90 }} />
          <input value={s.label} onChange={(e) => onChange(stats.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
            placeholder="Label" style={{ ...inp, flex: 1 }} />
          <button onClick={() => onChange(stats.filter((_, j) => j !== i))}
            style={{ padding: "0 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--red)", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ))}
      <button onClick={() => onChange([...stats, { value: "", label: "" }])}
        style={{ fontSize: 12, color: "var(--accent)", background: "transparent", border: "1px solid var(--accent-dim)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
        + Add stat
      </button>
    </Field>
  );
}

// ── Save button with status ───────────────────────────────────────────────────
function SaveBar({ onSave, saving, saved, error }: { onSave: () => void; saving: boolean; saved: boolean; error: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid var(--border)", marginTop: 8 }}>
      <button onClick={onSave} disabled={saving}
        style={{ padding: "9px 24px", borderRadius: 9, background: "var(--accent)", color: "#000", fontWeight: 700, fontSize: 13, border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
        {saving ? "Saving…" : "Save changes"}
      </button>
      {saved && !saving && <span style={{ fontSize: 12, color: "var(--green)" }}>✓ Saved</span>}
      {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: "hero",       label: "Hero",         icon: "🏠" },
  { id: "discover",   label: "Discover",     icon: "🔍" },
  { id: "categories", label: "Categories",   icon: "📂" },
  { id: "features",   label: "Features",     icon: "✨" },
  { id: "blog",       label: "Blog Preview", icon: "📖" },
  { id: "submit",     label: "Submit Tool",  icon: "📝" },
  { id: "about",      label: "About",        icon: "👥" },
  { id: "faq",        label: "FAQ",          icon: "❓" },
  { id: "newsletter", label: "Newsletter",   icon: "📧" },
];

// ── Section editors ───────────────────────────────────────────────────────────

function HeroEditor({ config, onChange }: { config: SiteConfig["hero"]; onChange: (v: SiteConfig["hero"]) => void }) {
  const upd = (k: keyof SiteConfig["hero"], v: unknown) => onChange({ ...config, [k]: v });
  return (
    <>
      <Input label="Badge text" value={config.badge} onChange={(v) => upd("badge", v)} placeholder="1,200+ AI tools curated by real editors" />
      <Input label="Headline line 1" value={config.headline1} onChange={(v) => upd("headline1", v)} placeholder="Find the right AI tool." />
      <Input label="Headline line 2 (accent color)" value={config.headline2} onChange={(v) => upd("headline2", v)} placeholder="Trust the review." />
      <Input label="Subheading" value={config.subheading} onChange={(v) => upd("subheading", v)} textarea placeholder="Editorial reviews, real upvotes…" />
      <Input label="Search placeholder" value={config.searchPlaceholder} onChange={(v) => upd("searchPlaceholder", v)} />
      <StatEditor stats={config.stats} onChange={(v) => upd("stats", v)} />
      <StringListEditor label="Quick filter tags" items={config.quickFilters} onChange={(v) => upd("quickFilters", v)} />
    </>
  );
}

function DiscoverEditor({ config, onChange }: { config: SiteConfig["discover"]; onChange: (v: SiteConfig["discover"]) => void }) {
  return (
    <>
      <Input label="Eyebrow text" value={config.eyebrow} onChange={(v) => onChange({ ...config, eyebrow: v })} />
      <Input label="Section heading" value={config.heading} onChange={(v) => onChange({ ...config, heading: v })} />
    </>
  );
}

function CategoriesEditor({ config, onChange }: { config: SiteConfig["categories"]; onChange: (v: SiteConfig["categories"]) => void }) {
  const upd = (k: keyof SiteConfig["categories"], v: string) => onChange({ ...config, [k]: v });
  return (
    <>
      <Input label="Eyebrow text" value={config.eyebrow} onChange={(v) => upd("eyebrow", v)} />
      <Input label="Section heading" value={config.heading} onChange={(v) => upd("heading", v)} />
      <Input label='"View all" label' value={config.viewAllLabel} onChange={(v) => upd("viewAllLabel", v)} />
      <Input label='"View all" link' value={config.viewAllHref} onChange={(v) => upd("viewAllHref", v)} placeholder="#" />
    </>
  );
}

function FeaturesEditor({ config, onChange }: { config: SiteConfig["features"]; onChange: (v: SiteConfig["features"]) => void }) {
  const updItem = (i: number, k: "icon" | "title" | "desc", v: string) =>
    onChange({ ...config, items: config.items.map((x, j) => j === i ? { ...x, [k]: v } : x) });

  return (
    <>
      <Input label="Eyebrow" value={config.eyebrow} onChange={(v) => onChange({ ...config, eyebrow: v })} />
      <Input label="Heading" value={config.heading} onChange={(v) => onChange({ ...config, heading: v })} />
      <Input label="Subheading" value={config.subheading} onChange={(v) => onChange({ ...config, subheading: v })} />
      <Field label="Feature cards">
        {config.items.map((item, i) => (
          <div key={i} style={{ ...card, padding: 14 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input value={item.icon} onChange={(e) => updItem(i, "icon", e.target.value)}
                style={{ ...inp, width: 52, textAlign: "center", fontSize: 18 }} placeholder="◎" />
              <input value={item.title} onChange={(e) => updItem(i, "title", e.target.value)}
                style={{ ...inp, flex: 1 }} placeholder="Feature title" />
              <button onClick={() => onChange({ ...config, items: config.items.filter((_, j) => j !== i) })}
                style={{ padding: "0 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--red)", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
            <textarea value={item.desc} onChange={(e) => updItem(i, "desc", e.target.value)}
              style={{ ...inp, resize: "vertical", minHeight: 60, lineHeight: 1.6 }} placeholder="Description" />
          </div>
        ))}
        <button onClick={() => onChange({ ...config, items: [...config.items, { icon: "◆", title: "", desc: "" }] })}
          style={{ fontSize: 12, color: "var(--accent)", background: "transparent", border: "1px solid var(--accent-dim)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
          + Add feature
        </button>
      </Field>
    </>
  );
}

function BlogSectionEditor({ config, onChange }: { config: SiteConfig["blog"]; onChange: (v: SiteConfig["blog"]) => void }) {
  const upd = (k: keyof SiteConfig["blog"], v: string) => onChange({ ...config, [k]: v });
  return (
    <>
      <Input label="Eyebrow" value={config.eyebrow} onChange={(v) => upd("eyebrow", v)} />
      <Input label="Heading" value={config.heading} onChange={(v) => upd("heading", v)} />
      <Input label='"View all" label' value={config.viewAllLabel} onChange={(v) => upd("viewAllLabel", v)} />
      <Input label='"View all" link' value={config.viewAllHref} onChange={(v) => upd("viewAllHref", v)} />
    </>
  );
}

function SubmitEditor({ config, onChange }: { config: SiteConfig["submit"]; onChange: (v: SiteConfig["submit"]) => void }) {
  const upd = (k: keyof SiteConfig["submit"], v: unknown) => onChange({ ...config, [k]: v });
  return (
    <>
      <Input label="Eyebrow" value={config.eyebrow} onChange={(v) => upd("eyebrow", v)} />
      <Input label="Heading" value={config.heading} onChange={(v) => upd("heading", v)} />
      <Input label="Subheading" value={config.subheading} onChange={(v) => upd("subheading", v)} />
      <Input label="Description" value={config.description} onChange={(v) => upd("description", v)} textarea />
      <StringListEditor label="Perks list" items={config.perks} onChange={(v) => upd("perks", v)} />
    </>
  );
}

function AboutEditor({ config, onChange }: { config: SiteConfig["about"]; onChange: (v: SiteConfig["about"]) => void }) {
  const upd = (k: keyof SiteConfig["about"], v: unknown) => onChange({ ...config, [k]: v });
  const updMember = (i: number, k: "name" | "role" | "bio" | "initials", v: string) =>
    upd("team", config.team.map((x, j) => j === i ? { ...x, [k]: v } : x));

  return (
    <>
      <Input label="Eyebrow" value={config.eyebrow} onChange={(v) => upd("eyebrow", v)} />
      <Input label="Heading" value={config.heading} onChange={(v) => upd("heading", v)} />
      <Input label="Paragraph 1" value={config.para1} onChange={(v) => upd("para1", v)} textarea />
      <Input label="Paragraph 2" value={config.para2} onChange={(v) => upd("para2", v)} textarea />
      <StatEditor stats={config.stats} onChange={(v) => upd("stats", v)} />
      <Input label="Team section heading" value={config.teamHeading} onChange={(v) => upd("teamHeading", v)} />
      <Field label="Team members">
        {config.team.map((m, i) => (
          <div key={i} style={{ ...card }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={m.initials} onChange={(e) => updMember(i, "initials", e.target.value)}
                style={{ ...inp, width: 60, textAlign: "center", fontWeight: 700 }} placeholder="SC" />
              <input value={m.name} onChange={(e) => updMember(i, "name", e.target.value)}
                style={{ ...inp, flex: 1 }} placeholder="Name" />
              <button onClick={() => upd("team", config.team.filter((_, j) => j !== i))}
                style={{ padding: "0 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--red)", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={m.role} onChange={(e) => updMember(i, "role", e.target.value)}
                style={{ ...inp, flex: 1 }} placeholder="Role" />
            </div>
            <input value={m.bio} onChange={(e) => updMember(i, "bio", e.target.value)}
              style={{ ...inp }} placeholder="Short bio" />
          </div>
        ))}
        <button onClick={() => upd("team", [...config.team, { name: "", role: "", bio: "", initials: "" }])}
          style={{ fontSize: 12, color: "var(--accent)", background: "transparent", border: "1px solid var(--accent-dim)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
          + Add member
        </button>
      </Field>
    </>
  );
}

function FAQEditor({ config, onChange }: { config: SiteConfig["faq"]; onChange: (v: SiteConfig["faq"]) => void }) {
  const updItem = (i: number, k: "q" | "a", v: string) =>
    onChange({ ...config, items: config.items.map((x, j) => j === i ? { ...x, [k]: v } : x) });

  return (
    <>
      <Input label="Eyebrow" value={config.eyebrow} onChange={(v) => onChange({ ...config, eyebrow: v })} />
      <Input label="Heading" value={config.heading} onChange={(v) => onChange({ ...config, heading: v })} />
      <Field label="FAQ items">
        {config.items.map((item, i) => (
          <div key={i} style={{ ...card }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 12, color: "var(--text3)", paddingTop: 10, flexShrink: 0, width: 20, textAlign: "center", fontWeight: 700 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <input value={item.q} onChange={(e) => updItem(i, "q", e.target.value)}
                  style={{ ...inp, marginBottom: 6, fontWeight: 600 }} placeholder="Question" />
                <textarea value={item.a} onChange={(e) => updItem(i, "a", e.target.value)}
                  style={{ ...inp, resize: "vertical", minHeight: 80, lineHeight: 1.6 }} placeholder="Answer" />
              </div>
              <button onClick={() => onChange({ ...config, items: config.items.filter((_, j) => j !== i) })}
                style={{ padding: "8px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--red)", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
          </div>
        ))}
        <button onClick={() => onChange({ ...config, items: [...config.items, { q: "", a: "" }] })}
          style={{ fontSize: 12, color: "var(--accent)", background: "transparent", border: "1px solid var(--accent-dim)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
          + Add question
        </button>
      </Field>
    </>
  );
}

function NewsletterEditor({ config, onChange }: { config: SiteConfig["newsletter"]; onChange: (v: SiteConfig["newsletter"]) => void }) {
  return (
    <>
      <Input label="Heading" value={config.heading} onChange={(v) => onChange({ ...config, heading: v })} />
      <Input label="Subheading" value={config.subheading} onChange={(v) => onChange({ ...config, subheading: v })} textarea />
      <Input label="Email placeholder" value={config.placeholder} onChange={(v) => onChange({ ...config, placeholder: v })} />
    </>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function HomepageEditor({ config: initial }: { config: SiteConfig }) {
  const [activeTab, setActiveTab] = useState("hero");
  const [config, setConfig] = useState<SiteConfig>(initial);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  const handleSave = (section: keyof SiteConfig) => {
    setSaving(true);
    setSaved((p) => ({ ...p, [section]: false }));
    setErrors((p) => ({ ...p, [section]: "" }));
    startTransition(async () => {
      try {
        await saveSiteConfig(section, config[section] as Record<string, unknown>);
        setSaved((p) => ({ ...p, [section]: true }));
        setTimeout(() => setSaved((p) => ({ ...p, [section]: false })), 3000);
      } catch (e: unknown) {
        setErrors((p) => ({ ...p, [section]: e instanceof Error ? e.message : "Save failed" }));
      } finally {
        setSaving(false);
      }
    });
  };

  const updSection = <K extends keyof SiteConfig>(key: K) => (val: SiteConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: val }));

  const SECTION_MAP: Record<string, { component: React.ReactNode; key: keyof SiteConfig; desc: string }> = {
    hero:       { key: "hero",       desc: "Top banner, headline, stats, search bar", component: <HeroEditor config={config.hero} onChange={updSection("hero")} /> },
    discover:   { key: "discover",   desc: "Discover tools section headings",          component: <DiscoverEditor config={config.discover} onChange={updSection("discover")} /> },
    categories: { key: "categories", desc: "Category grid section headings & link",    component: <CategoriesEditor config={config.categories} onChange={updSection("categories")} /> },
    features:   { key: "features",   desc: "Why PromptBulletin feature cards",         component: <FeaturesEditor config={config.features} onChange={updSection("features")} /> },
    blog:       { key: "blog",       desc: "Latest articles preview section",          component: <BlogSectionEditor config={config.blog} onChange={updSection("blog")} /> },
    submit:     { key: "submit",     desc: "Submit a tool CTA section",                component: <SubmitEditor config={config.submit} onChange={updSection("submit")} /> },
    about:      { key: "about",      desc: "Mission statement & team section",         component: <AboutEditor config={config.about} onChange={updSection("about")} /> },
    faq:        { key: "faq",        desc: "Frequently asked questions",               component: <FAQEditor config={config.faq} onChange={updSection("faq")} /> },
    newsletter: { key: "newsletter", desc: "Email newsletter sign-up section",         component: <NewsletterEditor config={config.newsletter} onChange={updSection("newsletter")} /> },
  };

  const active = SECTION_MAP[activeTab];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 0px)", overflow: "hidden" }}>
      {/* Section sidebar */}
      <aside style={{ width: 200, flexShrink: 0, background: "var(--bg2)", borderRight: "1px solid var(--border)", overflowY: "auto", padding: "16px 10px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 8px", marginBottom: 8 }}>Sections</p>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const hasSaved = saved[tab.id];
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px",
                borderRadius: 8, background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
                border: "none", cursor: "pointer", textAlign: "left", marginBottom: 2, transition: "all 0.15s",
                color: isActive ? "var(--text)" : "var(--text2)",
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1 }}>{tab.label}</span>
              {hasSaved && <span style={{ fontSize: 10, color: "var(--green)" }}>✓</span>}
            </button>
          );
        })}
      </aside>

      {/* Editor panel */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
        <div style={{ maxWidth: 720 }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "var(--font-space)", fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>
              {TABS.find((t) => t.id === activeTab)?.icon} {TABS.find((t) => t.id === activeTab)?.label}
            </h2>
            <p style={{ fontSize: 13, color: "var(--text3)", margin: "4px 0 0" }}>{active.desc}</p>
          </div>

          {/* Section form */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 28px" }}>
            {active.component}
            <SaveBar
              onSave={() => handleSave(active.key)}
              saving={saving}
              saved={!!saved[activeTab]}
              error={errors[activeTab] ?? ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
