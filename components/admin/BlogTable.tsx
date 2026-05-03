"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteBlogPost } from "@/app/admin/actions";

type Post = {
  id: string; title: string; slug: string;
  category: string; post_type: string | null;
  is_published: boolean; published_at: string | null;
  upvote_count: number;
};

const typeColor: Record<string, string> = {
  article:  "var(--accent2)",
  listicle: "var(--accent)",
};

export default function BlogTable({ posts }: { posts: Post[] }) {
  const [list, setList] = useState(posts);
  const [, startTransition] = useTransition();

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteBlogPost(id);
      setList((prev) => prev.filter((p) => p.id !== id));
    });
  };

  if (list.length === 0) {
    return (
      <div style={{ padding: "48px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--text3)" }}>No posts yet. Create your first one.</p>
      </div>
    );
  }

  return (
    <>
      {list.map((post, i) => (
        <div key={post.id} style={{
          display: "grid", gridTemplateColumns: "3fr 90px 110px 90px 90px 120px",
          padding: "14px 20px", alignItems: "center",
          borderBottom: i < list.length - 1 ? "1px solid var(--border)" : "none",
          background: i % 2 === 0 ? "var(--bg2)" : "transparent",
        }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{post.title}</span>
            <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 8 }}>/{post.slug}</span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100,
            background: `${typeColor[post.post_type ?? "article"]}22`,
            color: typeColor[post.post_type ?? "article"],
            display: "inline-block",
          }}>
            {post.post_type ?? "article"}
          </span>
          <span style={{ fontSize: 12, color: "var(--text2)" }}>{post.category}</span>
          <span style={{ fontSize: 12, color: "var(--text2)" }}>↑ {post.upvote_count}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100,
            background: post.is_published ? "var(--green-dim)" : "var(--bg3)",
            color: post.is_published ? "var(--green)" : "var(--text3)",
            border: `1px solid ${post.is_published ? "var(--green)" : "var(--border)"}`,
            display: "inline-block",
          }}>
            {post.is_published ? "Published" : "Draft"}
          </span>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Link href={`/admin/blog/${post.id}`} style={{
              padding: "5px 12px", borderRadius: 7, border: "1px solid var(--border2)",
              color: "var(--text2)", fontSize: 12, fontWeight: 500, textDecoration: "none",
            }}>Edit</Link>
            <button onClick={() => handleDelete(post.id, post.title)} style={{
              padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)",
              color: "var(--text3)", fontSize: 12, background: "transparent", cursor: "pointer",
            }}>Del</button>
          </div>
        </div>
      ))}
    </>
  );
}
