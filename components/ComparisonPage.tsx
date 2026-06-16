"use client";
import React, { useState } from "react";
import type { BlogPostDetail, ComparisonData } from "@/lib/queries";

// ── Sticky section nav ────────────────────────────────────────────────────────
const NAV_TABS = [
  { id: "quick-verdict",    label: "Quick Verdict"  },
  { id: "comparison-table", label: "Table"          },
  { id: "features",         label: "Features"       },
  { id: "pricing",          label: "Pricing"        },
  { id: "ease-of-use",      label: "Ease of Use"    },
  { id: "performance",      label: "Performance"    },
  { id: "pros-cons",        label: "Pros & Cons"    },
  { id: "use-cases",        label: "Use Cases"      },
  { id: "final-verdict",    label: "Final Verdict"  },
  { id: "faqs",             label: "FAQs"           },
];

function ComparisonSectionNav() {
  const [active, setActive] = useState("quick-verdict");

  const scrollTo = (id: string) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
  };

  return (
    // position:fixed — overflow-x:hidden on body breaks position:sticky
    <div style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 40, background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", overflowX: "auto", display: "flex", scrollbarWidth: "none" }}>
        {NAV_TABS.map((t) => (
          <button key={t.id} onClick={() => scrollTo(t.id)} style={{
            padding: "12px 16px", background: "transparent", border: "none", whiteSpace: "nowrap",
            borderBottom: `2px solid ${active === t.id ? "var(--accent)" : "transparent"}`,
            color: active === t.id ? "var(--text)" : "var(--text3)",
            fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: active === t.id ? 600 : 400,
            cursor: "pointer", transition: "all 0.15s", marginBottom: -1, flexShrink: 0,
          }}
          onMouseEnter={(e) => { if (active !== t.id) (e.currentTarget as HTMLElement).style.color = "var(--text2)"; }}
          onMouseLeave={(e) => { if (active !== t.id) (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}
          >{t.label}</button>
        ))}
      </div>
    </div>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function ComparisonPage({ post }: { post: BlogPostDetail }) {
  const comparison_data = (post as BlogPostDetail & { comparison_data?: ComparisonData | null }).comparison_data ?? null;

  if (!comparison_data) {
    return (
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "80px 24px 80px", fontFamily: "var(--font-inter)", color: "var(--text)" }}>
        <h1 style={{ fontFamily: "var(--font-space)", fontSize: 32, fontWeight: 700, margin: "0 0 16px" }}>{post.title}</h1>
        <p style={{ color: "var(--text3)" }}>No structured comparison data yet.</p>
      </div>
    );
  }

  const { tool_a, tool_b, quick_verdict, comparison_table, features_html, pricing_html,
    ease_of_use_html, performance_html, pros_a, cons_a, pros_b, cons_b,
    use_cases_a, use_cases_b, final_verdict_html, faqs } = comparison_data;

  return (
    <div style={{ fontFamily: "var(--font-inter)", color: "var(--text)" }}>
      <ComparisonSectionNav />
      {/* Spacer: navbar (64px) + comparison nav (~49px) */}
      <div style={{ height: 113 }} />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 80px" }}>
        <HeroSection post={post} tool_a={tool_a} tool_b={tool_b} />

        <QuickVerdictSection tool_a={tool_a} tool_b={tool_b} verdict={quick_verdict} />

        {comparison_table.length > 0 && (
          <ComparisonTableSection tool_a={tool_a} tool_b={tool_b} rows={comparison_table} />
        )}

        {features_html     && <ProseSection id="features"     title="Features"     html={features_html}     />}
        {pricing_html      && <ProseSection id="pricing"      title="Pricing"      html={pricing_html}      />}
        {ease_of_use_html  && <ProseSection id="ease-of-use"  title="Ease of Use"  html={ease_of_use_html}  />}
        {performance_html  && <ProseSection id="performance"  title="Performance"  html={performance_html}  />}

        {(pros_a.length > 0 || pros_b.length > 0 || cons_a.length > 0 || cons_b.length > 0) && (
          <ProsConsSection tool_a={tool_a} tool_b={tool_b} pros_a={pros_a} cons_a={cons_a} pros_b={pros_b} cons_b={cons_b} />
        )}

        {(use_cases_a.length > 0 || use_cases_b.length > 0) && (
          <UseCasesSection tool_a={tool_a} tool_b={tool_b} use_cases_a={use_cases_a} use_cases_b={use_cases_b} />
        )}

        {final_verdict_html && <FinalVerdictSection html={final_verdict_html} />}
        {faqs.length > 0    && <FaqsSection faqs={faqs} />}
        <AuthorCard post={post} />
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection({ post, tool_a, tool_b }: { post: BlogPostDetail; tool_a: ComparisonData["tool_a"]; tool_b: ComparisonData["tool_b"] }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <a href="/" style={{ color: "var(--text3)", textDecoration: "none" }}>Home</a>
        <span>/</span>
        <a href="/compare" style={{ color: "var(--text3)", textDecoration: "none" }}>Comparisons</a>
        <span>/</span>
        <span style={{ color: "var(--text2)" }}>{post.title}</span>
      </nav>

      {/* Title */}
      <h1 style={{ fontFamily: "var(--font-space)", fontSize: 36, fontWeight: 800, lineHeight: 1.15, color: "var(--text)", margin: "0 0 20px", letterSpacing: "-0.03em" }}>
        {post.title}
      </h1>

      {/* Author + meta */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#000", flexShrink: 0 }}>
          {post.author_initials}
        </div>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{post.author_name}</span>
          {(post as BlogPostDetail & { author_role?: string | null }).author_role && (
            <span style={{ fontSize: 13, color: "var(--text3)", marginLeft: 8 }}>
              {(post as BlogPostDetail & { author_role?: string | null }).author_role}
            </span>
          )}
        </div>
        {date && <span style={{ fontSize: 13, color: "var(--text3)" }}>· {date}</span>}
        {post.read_time && <span style={{ fontSize: 13, color: "var(--text3)" }}>· {post.read_time} read</span>}
      </div>

      {/* Cover image */}
      {post.cover_image_url && (
        <div style={{ marginBottom: 36, borderRadius: 16, overflow: "hidden", aspectRatio: "16/7" }}>
          <img
            src={post.cover_image_url}
            alt={post.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      {/* Tool A VS Tool B cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
        <ToolCard tool={tool_a} accentVar="var(--accent)" />
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-space)", fontWeight: 800, fontSize: 14, color: "var(--text2)", flexShrink: 0 }}>
          VS
        </div>
        <ToolCard tool={tool_b} accentVar="var(--accent2)" />
      </div>
    </div>
  );
}

function ToolCard({ tool, accentVar }: { tool: ComparisonData["tool_a"]; accentVar: string }) {
  return (
    <div style={{ background: "var(--bg2)", border: `1px solid var(--border)`, borderTop: `3px solid ${accentVar}`, borderRadius: 16, padding: 24, textAlign: "center" }}>
      {tool.logo_url && (
        <img src={tool.logo_url} alt={tool.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "contain", margin: "0 auto 10px", display: "block" }} />
      )}
      <div style={{ fontFamily: "var(--font-space)", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>{tool.name}</div>
      {tool.pricing && (
        <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: `color-mix(in srgb, ${accentVar} 15%, transparent)`, border: `1px solid ${accentVar}`, fontSize: 12, fontWeight: 600, color: accentVar, marginBottom: 16 }}>
          {tool.pricing}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tool.website_url && (
          <a href={tool.website_url} target="_blank" rel="noopener noreferrer nofollow"
            style={{ display: "block", padding: "9px 16px", borderRadius: 9, background: accentVar, color: "#000", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            Visit {tool.name}
          </a>
        )}
        {tool.slug && (
          <a href={`/tools/${tool.slug}`}
            style={{ display: "block", padding: "8px 16px", borderRadius: 9, border: "1px solid var(--border2)", color: "var(--text2)", fontSize: 13, textDecoration: "none" }}>
            View on PromptBulletin
          </a>
        )}
      </div>
    </div>
  );
}

// ── Section helpers ───────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <h2 style={{ fontFamily: "var(--font-space)", fontSize: 22, fontWeight: 700, color: "var(--text)", margin: "0 0 20px", letterSpacing: "-0.02em" }}>
      {title}
    </h2>
  );
}

// ── Quick Verdict ─────────────────────────────────────────────────────────────
function QuickVerdictSection({ tool_a, tool_b, verdict }: { tool_a: ComparisonData["tool_a"]; tool_b: ComparisonData["tool_b"]; verdict: ComparisonData["quick_verdict"] }) {
  return (
    <section id="quick-verdict" style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <h2 style={{ fontFamily: "var(--font-space)", fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>Quick Verdict</h2>
      </div>
      {verdict.summary && (
        <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.65, margin: "0 0 24px" }}>{verdict.summary}</p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--font-space)", fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Choose {tool_a.name} if…
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {verdict.choose_a_if.map((item, i) => (
              <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8, fontSize: 14, color: "var(--text2)", lineHeight: 1.5 }}>
                <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }}>→</span>{item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-space)", fontSize: 12, fontWeight: 700, color: "var(--accent2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Choose {tool_b.name} if…
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {verdict.choose_b_if.map((item, i) => (
              <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8, fontSize: 14, color: "var(--text2)", lineHeight: 1.5 }}>
                <span style={{ color: "var(--accent2)", flexShrink: 0, marginTop: 2 }}>→</span>{item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ── Comparison table ──────────────────────────────────────────────────────────
function ComparisonTableSection({ tool_a, tool_b, rows }: { tool_a: ComparisonData["tool_a"]; tool_b: ComparisonData["tool_b"]; rows: ComparisonData["comparison_table"] }) {
  return (
    <section id="comparison-table" style={{ marginBottom: 48 }}>
      <SectionHeader title="Side-by-Side Comparison" />
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 480 }}>
          <thead>
            <tr style={{ background: "var(--bg3)" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid var(--border)", width: "34%" }}>Feature</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 14, color: "var(--accent)", borderBottom: "1px solid var(--border)" }}>{tool_a.name}</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 14, color: "var(--accent2)", borderBottom: "1px solid var(--border)" }}>{tool_b.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "var(--bg2)" : "var(--bg)" }}>
                <td style={{ padding: "11px 16px", fontWeight: 600, color: "var(--text2)", borderBottom: "1px solid var(--border)" }}>{row.feature}</td>
                <td style={{ padding: "11px 16px", color: "var(--text)", borderBottom: "1px solid var(--border)" }}>{row.tool_a}</td>
                <td style={{ padding: "11px 16px", color: "var(--text)", borderBottom: "1px solid var(--border)" }}>{row.tool_b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Prose sections ────────────────────────────────────────────────────────────
function ProseSection({ id, title, html }: { id: string; title: string; html: string }) {
  return (
    <section id={id} style={{ marginBottom: 48 }}>
      <SectionHeader title={title} />
      <div className="pb-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

// ── Pros & Cons ───────────────────────────────────────────────────────────────
function ProsConsSection({ tool_a, tool_b, pros_a, cons_a, pros_b, cons_b }: {
  tool_a: ComparisonData["tool_a"]; tool_b: ComparisonData["tool_b"];
  pros_a: string[]; cons_a: string[]; pros_b: string[]; cons_b: string[];
}) {
  return (
    <section id="pros-cons" style={{ marginBottom: 48 }}>
      <SectionHeader title="Pros & Cons" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ProsConsCard name={tool_a.name} accentVar="var(--accent)" pros={pros_a} cons={cons_a} />
        <ProsConsCard name={tool_b.name} accentVar="var(--accent2)" pros={pros_b} cons={cons_b} />
      </div>
    </section>
  );
}

function ProsConsCard({ name, accentVar, pros, cons }: { name: string; accentVar: string; pros: string[]; cons: string[] }) {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderTop: `3px solid ${accentVar}`, borderRadius: 14, padding: 22 }}>
      <div style={{ fontFamily: "var(--font-space)", fontSize: 16, fontWeight: 700, color: accentVar, marginBottom: 16 }}>{name}</div>
      {pros.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {pros.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7, fontSize: 14, color: "var(--text2)", lineHeight: 1.5 }}>
              <span style={{ color: "var(--green)", fontWeight: 700, flexShrink: 0 }}>✓</span>{p}
            </div>
          ))}
        </div>
      )}
      {cons.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          {cons.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7, fontSize: 14, color: "var(--text2)", lineHeight: 1.5 }}>
              <span style={{ color: "var(--red)", fontWeight: 700, flexShrink: 0 }}>✗</span>{c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Use Cases ─────────────────────────────────────────────────────────────────
function UseCasesSection({ tool_a, tool_b, use_cases_a, use_cases_b }: {
  tool_a: ComparisonData["tool_a"]; tool_b: ComparisonData["tool_b"];
  use_cases_a: string[]; use_cases_b: string[];
}) {
  return (
    <section id="use-cases" style={{ marginBottom: 48 }}>
      <SectionHeader title="Best Use Cases" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <UseCasesCard name={tool_a.name} accentVar="var(--accent)" items={use_cases_a} />
        <UseCasesCard name={tool_b.name} accentVar="var(--accent2)" items={use_cases_b} />
      </div>
    </section>
  );
}

function UseCasesCard({ name, accentVar, items }: { name: string; accentVar: string; items: string[] }) {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderTop: `3px solid ${accentVar}`, borderRadius: 14, padding: 22 }}>
      <div style={{ fontFamily: "var(--font-space)", fontSize: 15, fontWeight: 700, color: accentVar, marginBottom: 14 }}>{name}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8, fontSize: 14, color: "var(--text2)", lineHeight: 1.5 }}>
            <span style={{ color: accentVar, flexShrink: 0, marginTop: 2 }}>•</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Final Verdict ─────────────────────────────────────────────────────────────
function FinalVerdictSection({ html }: { html: string }) {
  return (
    <section id="final-verdict" style={{ marginBottom: 48 }}>
      <SectionHeader title="Final Verdict" />
      <div style={{ borderLeft: "4px solid var(--accent)", background: "color-mix(in srgb, var(--accent) 8%, transparent)", borderRadius: "0 12px 12px 0", padding: "20px 24px" }}>
        <div className="pb-prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}

// ── FAQs ──────────────────────────────────────────────────────────────────────
function FaqsSection({ faqs }: { faqs: ComparisonData["faqs"] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faqs" style={{ marginBottom: 48 }}>
      <SectionHeader title="Frequently Asked Questions" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{ width: "100%", textAlign: "left", padding: "16px 20px", background: openIndex === i ? "var(--bg3)" : "var(--bg2)", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "var(--font-space)", fontSize: 15, fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>{faq.q}</span>
              <span style={{ color: "var(--accent)", fontSize: 18, flexShrink: 0, transform: openIndex === i ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>+</span>
            </button>
            {openIndex === i && (
              <div style={{ padding: "16px 20px", background: "var(--bg)", borderTop: "1px solid var(--border)", fontSize: 14, color: "var(--text2)", lineHeight: 1.65 }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Author card ───────────────────────────────────────────────────────────────
function AuthorCard({ post }: { post: BlogPostDetail }) {
  if (!post.author_name) return null;
  const p = post as BlogPostDetail & { author_role?: string | null; author_bio?: string | null };

  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#000", flexShrink: 0 }}>
        {post.author_initials}
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-space)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{post.author_name}</div>
        {p.author_role && <div style={{ fontSize: 13, color: "var(--accent)", marginBottom: 6 }}>{p.author_role}</div>}
        {p.author_bio  && <div style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6 }}>{p.author_bio}</div>}
      </div>
    </div>
  );
}
