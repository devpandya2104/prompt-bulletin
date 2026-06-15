"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Author } from "@/lib/queries";

function AuthorCard({ author, postCount }: { author: Author; postCount: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/admin/authors/${author.id}`} style={{
      display: "grid",
      gridTemplateColumns: "56px 1fr auto",
      gap: 16, alignItems: "center",
      background: "var(--bg2)",
      border: `1px solid ${hovered ? "var(--accent)" : "var(--border)"}`,
      borderRadius: 12, padding: "16px 20px", textDecoration: "none",
      transition: "border-color 0.15s",
    }}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        background: "var(--bg3)", border: "2px solid var(--accent)",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0,
      }}>
        {author.avatar_url ? (
          <img src={author.avatar_url} alt={author.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontFamily: "var(--font-space)", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>
            {author.initials}
          </span>
        )}
      </div>

      <div>
        <p style={{ fontFamily: "var(--font-space)", fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 3px" }}>
          {author.name}
        </p>
        {author.role && (
          <p style={{ fontSize: 12, color: "var(--accent)", margin: "0 0 4px" }}>{author.role}</p>
        )}
        {author.bio && (
          <p style={{ fontSize: 12, color: "var(--text3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 480 }}>
            {author.bio}
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <span style={{ fontSize: 11, color: "var(--text3)", background: "var(--bg3)", padding: "3px 10px", borderRadius: 20, border: "1px solid var(--border)" }}>
          {postCount} post{postCount !== 1 ? "s" : ""}
        </span>
        <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>Edit →</span>
      </div>
    </Link>
  );
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [countMap, setCountMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: authorsData }, { data: postData }] = await Promise.all([
        supabase.from("authors").select("*").order("sort_order"),
        supabase.from("blog_posts").select("author_id").not("author_id", "is", null),
      ]);
      const authors = (authorsData ?? []) as Author[];
      const map: Record<string, number> = {};
      for (const p of postData ?? []) {
        if (p.author_id) map[p.author_id] = (map[p.author_id] ?? 0) + 1;
      }
      setAuthors(authors);
      setCountMap(map);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-space)", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
            Authors
          </h1>
          <p style={{ fontSize: 13, color: "var(--text3)", margin: "4px 0 0" }}>
            {loading ? "Loading…" : `${authors.length} author${authors.length !== 1 ? "s" : ""} · select in the blog post editor to assign`}
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

      {loading ? (
        <div style={{ color: "var(--text3)", fontSize: 14, padding: "40px 0", textAlign: "center" }}>Loading authors…</div>
      ) : authors.length === 0 ? (
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
            <AuthorCard key={a.id} author={a} postCount={countMap[a.id] ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
