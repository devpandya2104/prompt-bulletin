import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 0;

async function StatCard({ label, value, href, color = "var(--accent)" }: {
  label: string; value: number | string; href: string; color?: string;
}) {
  return (
    <Link href={href} style={{
      display: "block", padding: "24px 28px", borderRadius: 14, textDecoration: "none",
      background: "var(--bg2)", border: "1px solid var(--border)", transition: "border-color 0.15s",
    }}>
      <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-space)", color, letterSpacing: "-0.04em", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 6 }}>{label}</div>
    </Link>
  );
}

export default async function AdminDashboard() {
  const supabase = await createAdminClient();

  const [
    { count: totalTools },
    { count: publishedTools },
    { count: totalPosts },
    { count: totalReviews },
  ] = await Promise.all([
    supabase.from("tools").select("*", { count: "exact", head: true }),
    supabase.from("tools").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("tool_reviews").select("*", { count: "exact", head: true }),
  ]);

  const { data: recentTools } = await supabase
    .from("tools")
    .select("id, name, slug, is_published, upvote_count")
    .order("created_at", { ascending: false })
    .limit(5);

  const quickActions = [
    { label: "Add New Tool",   href: "/admin/tools/new", icon: "⚙", desc: "Create a new tool listing" },
    { label: "Manage Tools",   href: "/admin/tools",     icon: "📋", desc: "Edit or remove existing tools" },
    { label: "Blog Posts",     href: "/admin/blog",      icon: "✍", desc: "Manage blog articles & listicles" },
    { label: "Categories",     href: "/admin/categories",icon: "📂", desc: "Edit tool categories" },
  ];

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-space)", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "var(--text3)", margin: "4px 0 0" }}>Welcome back — here is your site at a glance.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        <StatCard label="Total tools"      value={totalTools ?? 0}     href="/admin/tools" />
        <StatCard label="Published tools"  value={publishedTools ?? 0} href="/admin/tools" color="var(--green)" />
        <StatCard label="Blog posts"       value={totalPosts ?? 0}     href="/admin/blog"  color="var(--accent2)" />
        <StatCard label="Reviews"          value={totalReviews ?? 0}   href="/admin/tools" color="var(--text2)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Quick actions */}
        <div>
          <h2 style={{ fontFamily: "var(--font-space)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 14, letterSpacing: "-0.02em" }}>
            Quick Actions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {quickActions.map((a) => (
              <Link key={a.href} href={a.href} style={{
                display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 20px",
                borderRadius: 12, textDecoration: "none",
                background: "var(--bg2)", border: "1px solid var(--border)",
              }}>
                <span style={{ fontSize: 22 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-space)" }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent tools */}
        <div>
          <h2 style={{ fontFamily: "var(--font-space)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 14, letterSpacing: "-0.02em" }}>
            Recent Tools
          </h2>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            {(recentTools ?? []).map((tool, i) => (
              <Link key={tool.id} href={`/admin/tools/${tool.id}`} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", textDecoration: "none",
                borderBottom: i < (recentTools?.length ?? 0) - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{tool.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{tool.upvote_count} upvotes</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
                  background: tool.is_published ? "var(--green-dim)" : "var(--bg3)",
                  color: tool.is_published ? "var(--green)" : "var(--text3)",
                }}>
                  {tool.is_published ? "Live" : "Draft"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
