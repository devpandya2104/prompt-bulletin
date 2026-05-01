"use client";
import { TEAM } from "@/lib/data";

const stats = [
  ["2024",   "Founded"],
  ["1,200+", "Tools indexed"],
  ["48K",    "Members"],
  ["100%",   "Editorial independence"],
];

export default function About() {
  return (
    <section id="about" className="py-20 px-6" style={{ borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-start">
        {/* Left: Mission */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Our mission</p>
          <h2 className="text-4xl font-bold tracking-tight leading-tight mb-5" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
            Unbiased. Thorough. Built for trust.
          </h2>
          <p className="text-[15px] leading-[1.75] mb-4" style={{ color: "var(--text2)" }}>
            PromptBulletin was founded by a team of journalists, developers, and marketers who were exhausted by listicles stuffed with affiliate links and zero editorial integrity.
          </p>
          <p className="text-[15px] leading-[1.75] mb-7" style={{ color: "var(--text2)" }}>
            We built the platform we wished existed — one where a 4.8★ score means something, and where &quot;Editor&apos;s Choice&quot; is earned, not purchased.
          </p>
          <div className="flex gap-3 flex-wrap">
            {stats.map(([val, label]) => (
              <div key={label} className="px-5 py-3.5 rounded-xl" style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}>
                <div className="text-[22px] font-bold tracking-tight" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>{val}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Team */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--text3)" }}>The team</p>
          <div className="flex flex-col gap-3">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}>
                  <span className="text-sm font-bold" style={{ fontFamily: "var(--font-space)", color: "var(--accent)" }}>{member.initials}</span>
                </div>
                <div>
                  <div className="text-[15px] font-bold" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>{member.name}</div>
                  <div className="text-xs font-medium mb-0.5" style={{ color: "var(--accent)" }}>{member.role}</div>
                  <div className="text-[13px]" style={{ color: "var(--text3)" }}>{member.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
