import type { FooterConfig } from "@/lib/site-config";
import { DEFAULT_FOOTER } from "@/lib/site-config";

export default function Footer({ config = DEFAULT_FOOTER }: { config?: FooterConfig }) {
  return (
    <footer className="px-6 pt-12 pb-8" style={{ borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="var(--accent)"/>
                <path d="M19 14L19.9 16.1L22 17L19.9 17.9L19 20L18.1 17.9L16 17L18.1 16.1L19 14Z" fill="var(--accent)" opacity="0.5"/>
                <path d="M5 3L5.7 4.8L7.5 5.5L5.7 6.2L5 8L4.3 6.2L2.5 5.5L4.3 4.8L5 3Z" fill="var(--accent)" opacity="0.5"/>
              </svg>
              <span className="font-bold text-base" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>PromptBulletin</span>
            </div>
            <p className="text-[13.5px] leading-[1.7] max-w-[280px]" style={{ color: "var(--text3)" }}>
              {config.description}
            </p>
          </div>

          {/* Link columns */}
          {config.columns.map((col) => (
            <div key={col.title}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text2)" }}>{col.title}</div>
              <div className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <a key={l.label} href={l.href}
                    className="footer-link text-[13.5px] no-underline transition-colors duration-150"
                    style={{ color: "var(--text3)" }}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-[13px]" style={{ color: "var(--text3)" }}>{config.copyright}</span>
          <div className="flex gap-5">
            {config.legalLinks.map((l) => (
              <a key={l.label} href={l.href}
                className="footer-link text-[13px] no-underline transition-colors duration-150"
                style={{ color: "var(--text3)" }}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
