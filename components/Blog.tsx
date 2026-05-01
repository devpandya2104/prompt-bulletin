"use client";
import type { BlogPost } from "@/lib/queries";

export default function Blog({ posts }: { posts: BlogPost[] }) {
  return (
    <section id="blog" className="py-20 px-6" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>From the editors</p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>Latest articles</h2>
          </div>
          <a href="/blog" className="text-sm font-medium flex items-center gap-1 no-underline whitespace-nowrap" style={{ color: "var(--accent)" }}>
            All articles
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <article key={post.id}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
              style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              onClick={() => window.location.href = `/blog/${post.slug}`}
            >
              <div className="h-40 flex items-center justify-center relative" style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                {post.cover_image_url ? (
                  <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 8px)" }} />
                    <span className="text-xs text-center px-5" style={{ fontFamily: "monospace", color: "var(--text3)" }}>[ article cover image ]</span>
                  </>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                    {post.category}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text3)" }}>{post.read_time} read</span>
                </div>
                <h3 className="text-base font-bold leading-snug mb-4" style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>{post.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold"
                      style={{ background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--text3)" }}>
                      {post.author_initials}
                    </div>
                    <span className="text-xs" style={{ color: "var(--text3)" }}>
                      {post.author_name} · {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                    <span className="text-xs" style={{ color: "var(--text3)" }}>{post.upvote_count}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
