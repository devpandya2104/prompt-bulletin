import type { FeaturesConfig } from "@/lib/site-config";
import { DEFAULT_FEATURES } from "@/lib/site-config";

export default function Features({ config = DEFAULT_FEATURES }: { config?: FeaturesConfig }) {
  return (
    <section id="features" className="py-20 px-6" style={{ borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>{config.eyebrow}</p>
          <h2 className="text-4xl font-bold tracking-tight mb-3.5" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
            {config.heading}
          </h2>
          <p className="text-base mx-auto max-w-md" style={{ color: "var(--text2)" }}>{config.subheading}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 2 }}>
          {config.items.map((f, i) => (
            <div key={f.title} className="p-8"
              style={{ borderRight: i % 3 < 2 ? "1px solid var(--border)" : "none", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
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
