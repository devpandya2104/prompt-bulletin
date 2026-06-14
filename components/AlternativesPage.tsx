import Link from "next/link";

type AlternativeTool = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  rating: number;
  pricing: string;
  pros: string[];
  cons: string[];
  categories: { name: string; slug: string } | null;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="13" height="13" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "var(--accent)" : "none"}
          stroke="var(--accent)" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

export default function AlternativesPage({
  rootTool,
  alternatives,
}: {
  rootTool: AlternativeTool;
  alternatives: AlternativeTool[];
}) {
  const categoryName = rootTool.categories?.name ?? "AI";

  return (
    <main className="pt-16 min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <section className="px-6 pt-14 pb-10 max-w-7xl mx-auto">
        <div className="max-w-[820px] mx-auto">
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text3)" }}>
            <Link href="/" className="no-underline hover:underline" style={{ color: "var(--text3)" }}>Home</Link>
            <span>/</span>
            <Link href="/alternatives" className="no-underline hover:underline" style={{ color: "var(--text3)" }}>Alternatives</Link>
            <span>/</span>
            <span style={{ color: "var(--text2)" }}>{rootTool.name}</span>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent)" }}>
              {categoryName}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text3)" }}>
              {alternatives.length} alternatives
            </span>
          </div>

          <h1 className="text-[42px] font-black leading-[1.1] tracking-tight mb-4"
            style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
            Best {rootTool.name} Alternatives in 2026
          </h1>
          <p className="text-[18px] leading-[1.65] mb-6 italic"
            style={{ fontFamily: "var(--font-lora)", color: "var(--text2)" }}>
            We compared {alternatives.length} {categoryName.toLowerCase()} tools to find the best alternatives to {rootTool.name}.
            Here are the ones worth switching to, ranked by rating.
          </p>

          {/* Root tool badge */}
          <div className="rounded-xl p-4 mb-8 flex gap-3 items-start"
            style={{ background: "var(--bg3)", border: "1px solid var(--border2)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            <p className="text-sm m-0" style={{ color: "var(--text2)" }}>
              <strong style={{ color: "var(--text)" }}>Comparing against:</strong>{" "}
              <Link href={`/tools/${rootTool.slug}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
                {rootTool.name}
              </Link>
              {rootTool.tagline ? ` — ${rootTool.tagline}` : ""}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <div style={{ borderTop: "1px solid var(--border)" }} />
      </div>

      {/* Quick comparison table */}
      {alternatives.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-10 pb-10">
          <div className="max-w-[820px] mx-auto">
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)", fontFamily: "var(--font-space)" }}>
              Quick Comparison
            </h2>
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ background: "var(--bg3)" }}>
                    {["Tool", "Rating", "Pricing", "Free Tier", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                        style={{ color: "var(--text)", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-space)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((tool, i) => (
                    <tr key={tool.id} style={{ borderBottom: i < alternatives.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--text)" }}>
                        <a href={`#alt-${tool.slug}`} className="no-underline hover:underline" style={{ color: "var(--text)" }}>
                          {tool.name}
                        </a>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text2)" }}>{tool.rating}/5</td>
                      <td className="px-4 py-3" style={{ color: "var(--text2)" }}>{tool.pricing}</td>
                      <td className="px-4 py-3">
                        {tool.pricing?.toLowerCase().includes("free") ? (
                          <span style={{ color: "var(--green)" }}>✓</span>
                        ) : (
                          <span style={{ color: "var(--red)" }}>✗</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/tools/${tool.slug}`}
                          className="text-xs font-medium no-underline"
                          style={{ color: "var(--accent)" }}>
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Alternative cards */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="max-w-[820px] mx-auto space-y-6">
          {alternatives.map((tool, i) => (
            <article
              key={tool.id}
              id={`alt-${tool.slug}`}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderTop: `2px solid ${i === 0 ? "var(--accent)" : i === 1 ? "var(--accent2)" : "var(--green)"}`,
                scrollMarginTop: "5rem",
              }}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "var(--bg3)", color: "var(--text3)", border: "1px solid var(--border)" }}>
                        #{i + 1}
                      </span>
                      <h3 className="text-xl font-bold m-0" style={{ color: "var(--text)", fontFamily: "var(--font-space)" }}>
                        {tool.name}
                      </h3>
                    </div>
                    <p className="text-xs m-0" style={{ color: "var(--text3)" }}>{tool.categories?.name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Stars rating={tool.rating} />
                    <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{tool.rating}</span>
                    <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{tool.pricing}</span>
                  </div>
                </div>

                <p className="text-[15px] leading-[1.75] mb-5"
                  style={{ fontFamily: "var(--font-lora)", color: "var(--text2)" }}>
                  {tool.tagline || tool.description}
                </p>

                {(tool.pros?.length > 0 || tool.cons?.length > 0) && (
                  <div className="grid sm:grid-cols-2 gap-4 mb-5">
                    {tool.pros?.length > 0 && (
                      <div className="rounded-xl p-4" style={{ background: "var(--green-dim)", border: "1px solid var(--green)" }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--green)" }}>Pros</p>
                        <ul className="space-y-1.5 list-none p-0 m-0">
                          {tool.pros.slice(0, 3).map((pro, pi) => (
                            <li key={pi} className="flex gap-2 text-sm" style={{ color: "var(--text2)" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" className="mt-0.5 shrink-0">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {tool.cons?.length > 0 && (
                      <div className="rounded-xl p-4" style={{ background: "var(--red-dim)", border: "1px solid var(--red)" }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--red)" }}>Cons</p>
                        <ul className="space-y-1.5 list-none p-0 m-0">
                          {tool.cons.slice(0, 3).map((con, ci) => (
                            <li key={ci} className="flex gap-2 text-sm" style={{ color: "var(--text2)" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" className="mt-0.5 shrink-0">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <Link href={`/tools/${tool.slug}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold no-underline transition-opacity hover:opacity-85"
                  style={{ background: "var(--accent)", color: "#000" }}>
                  View Full Review →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="max-w-[820px] mx-auto">
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text)", fontFamily: "var(--font-space)" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: `What is the best alternative to ${rootTool.name}?`,
                a: alternatives[0]
                  ? `${alternatives[0].name} is our top-rated alternative to ${rootTool.name}, with a ${alternatives[0].rating}/5 rating${alternatives[0].pricing?.toLowerCase().includes("free") ? " and a free tier available" : ""}.`
                  : `See our full comparison table above for ranked alternatives.`,
              },
              {
                q: `Is there a free alternative to ${rootTool.name}?`,
                a: (() => {
                  const free = alternatives.filter((t) => t.pricing?.toLowerCase().includes("free"));
                  return free.length > 0
                    ? `Yes — ${free.map((t) => t.name).join(", ")} ${free.length === 1 ? "has" : "all have"} free tiers.`
                    : `The alternatives listed above are paid tools. Check each tool's pricing page for trial options.`;
                })(),
              },
              {
                q: `How did you choose these ${rootTool.name} alternatives?`,
                a: `We selected these alternatives based on editorial ratings, user reviews, feature overlap with ${rootTool.name}, and value for money. All tools are tested by our editorial team.`,
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl p-5" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
                <h3 className="font-semibold mb-2 text-[15px]" style={{ color: "var(--text)", fontFamily: "var(--font-space)" }}>{q}</h3>
                <p className="text-sm leading-relaxed m-0" style={{ color: "var(--text2)", fontFamily: "var(--font-lora)" }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
