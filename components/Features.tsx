const features = [
  { icon: "◎", title: "Editorial Reviews",    desc: "Every tool reviewed hands-on using a standardized 12-point rubric. No sponsored rankings in organic results — ever." },
  { icon: "▲", title: "Community Upvoting",   desc: "One vote per member, with anti-fraud detection. Rankings reflect real user enthusiasm, not astroturfing." },
  { icon: "⊞", title: "Side-by-Side Compare", desc: "Pick any two tools in the same category and see pricing, features, and ratings in a structured comparison table." },
  { icon: "◈", title: "Structured Data",      desc: 'Every listing includes pricing tiers, platforms, pros/cons, and "best for" use cases — not just fluffy prose.' },
  { icon: "◆", title: "Save & Collect",       desc: "Bookmark tools and organize them into private or shareable collections for your team." },
  { icon: "⚡", title: "Fast Search",          desc: "Keyword search with autocomplete, filters by category, price, and platform. Results in under 200ms." },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-6" style={{ borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Why PromptBulletin</p>
          <h2 className="text-4xl font-bold tracking-tight mb-3.5" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
            Built for people who hate noise
          </h2>
          <p className="text-base mx-auto max-w-md" style={{ color: "var(--text2)" }}>We do the research. You get the shortlist.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 2 }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className="p-8"
              style={{
                borderRight:  i % 3 < 2 ? "1px solid var(--border)" : "none",
                borderBottom: i < 3     ? "1px solid var(--border)" : "none",
              }}
            >
              <div className="text-2xl mb-4" style={{ color: "var(--accent)" }}>{f.icon}</div>
              <h3 className="text-[17px] font-bold mb-2" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
