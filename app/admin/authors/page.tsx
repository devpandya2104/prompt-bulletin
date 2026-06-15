import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Author } from "@/lib/queries";

export const revalidate = 0;

export default async function AdminAuthorsPage() {
  const supabase = await createAdminClient();

  const { data: authorsData } = await supabase.from("authors").select("*").order("sort_order");
  const authors = (authorsData ?? []) as Author[];

  // Guard: author_id column may not exist if migration is pending
  const { data: postData } = await supabase
    .from("blog_posts")
    .select("author_id")
    .not("author_id", "is", null);

  const countMap: Record<string, number> = {};
  for (const p of postData ?? []) {
    if (p.author_id) countMap[p.author_id] = (countMap[p.author_id] ?? 0) + 1;
  }

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-space)", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
            Authors
          </h1>
          <p style={{ fontSize: 13, color: "var(--text3)", margin: "4px 0 0" }}>
            {authors.length} author{authors.length !== 1 ? "s" : ""} · select in the blog post editor to assign
          </p>
        </div>
        <Link href="/admin/authors/new" style={{
          padding: "9px 18px", borderRadius: 9, background: "var(--accent)",
          color: "#000", fontWeight: 700, fontSize: 13, textDecoration: "none",
          fontFamily: "var(--font-space)",
        }}>
          + New Author
        </Link>
      </div>

      {authors.length === 0 ? (
        <div style={{
          background: "var(--bg2)", border: "1px dashed var(--border2)", borderRadius: 14,
          padding: "48px 32px", textAlign: "center",
        }}>
          <p style={{ fontSize: 15, color: "var(--text2)", margin: "0 0 8px" }}>No authors yet</p>
          <p style={{ fontSize: 13, color: "var(--text3)", margin: "0 0 20px" }}>
            Create authors here, then assign them to blog posts from the post editor.
          </p>
          <Link href="/admin/authors/new" style={{
            display: "inline-block", padding: "9px 20px", borderRadius: 9,
            background: "var(--accent)", color: "#000", fontWeight: 700, fontSize: 13,
            textDecoration: "none",
          }}>
            Create first author
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {authors.map((a) => (
            <Link key={a.id} href={`/admin/authors/${a.id}`} className="admin-author-card" style={{
              display: "grid",
              gridTemplateColumns: "56px 1fr auto",
              gap: 16, alignItems: "center",
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "16px 20px", textDecoration: "none",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "var(--bg3)", border: "2px solid var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0,
              }}>
                {a.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.avatar_url} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontFamily: "var(--font-space)", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>
                    {a.initials}
                  </span>
                )}
              </div>

              <div>
                <p style={{ fontFamily: "var(--font-space)", fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 3px" }}>
                  {a.name}
                </p>
                {a.role && (
                  <p style={{ fontSize: 12, color: "var(--accent)", margin: "0 0 4px" }}>{a.role}</p>
                )}
                {a.bio && (
                  <p style={{ fontSize: 12, color: "var(--text3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 480 }}>
                    {a.bio}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontSize: 11, color: "var(--text3)", background: "var(--bg3)", padding: "3px 10px", borderRadius: 20, border: "1px solid var(--border)" }}>
                  {countMap[a.id] ?? 0} post{(countMap[a.id] ?? 0) !== 1 ? "s" : ""}
                </span>
                <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>Edit →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
