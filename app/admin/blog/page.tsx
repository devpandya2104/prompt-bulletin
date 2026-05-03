import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import BlogTable from "@/components/admin/BlogTable";

export const revalidate = 0;

export default async function AdminBlogPage() {
  const supabase = await createAdminClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, category, post_type, is_published, published_at, upvote_count")
    .order("published_at", { ascending: false });

  const all = (posts ?? []) as {
    id: string; title: string; slug: string; category: string;
    post_type: string | null; is_published: boolean;
    published_at: string | null; upvote_count: number;
  }[];

  const published = all.filter((p) => p.is_published).length;

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-space)", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>Blog Posts</h1>
          <p style={{ fontSize: 13, color: "var(--text3)", margin: "4px 0 0" }}>
            {published} published · {all.length - published} draft
          </p>
        </div>
        <Link href="/admin/blog/new" style={{
          padding: "9px 18px", borderRadius: 9, background: "var(--accent)",
          color: "#000", fontWeight: 700, fontSize: 13, textDecoration: "none",
          fontFamily: "var(--font-space)",
        }}>
          + New Post
        </Link>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "3fr 90px 110px 90px 90px 120px",
          background: "var(--bg3)", padding: "10px 20px", borderBottom: "1px solid var(--border)",
        }}>
          {["Title", "Type", "Category", "Upvotes", "Status", ""].map((h) => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
          ))}
        </div>
        <BlogTable posts={all} />
      </div>
    </div>
  );
}
