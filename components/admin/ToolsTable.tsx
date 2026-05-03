"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteTool } from "@/app/admin/actions";

type Tool = {
  id: string; name: string; slug: string;
  rating: number; upvote_count: number; is_published: boolean;
  categories: { name: string } | null;
};

export default function ToolsTable({ tools }: { tools: Tool[] }) {
  const [list, setList] = useState(tools);
  const [, startTransition] = useTransition();

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteTool(id);
      setList((prev) => prev.filter((t) => t.id !== id));
    });
  };

  if (list.length === 0) {
    return (
      <div style={{ padding: "48px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--text3)" }}>No tools yet. Add your first one.</p>
      </div>
    );
  }

  return (
    <>
      {list.map((tool, i) => (
        <div key={tool.id} style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 80px 70px 90px 120px",
          padding: "14px 20px", alignItems: "center",
          borderBottom: i < list.length - 1 ? "1px solid var(--border)" : "none",
          background: i % 2 === 0 ? "var(--bg2)" : "transparent",
        }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{tool.name}</span>
            <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 8 }}>{tool.slug}</span>
          </div>
          <span style={{ fontSize: 13, color: "var(--text2)" }}>{tool.categories?.name ?? "—"}</span>
          <span style={{ fontSize: 13, color: "var(--text2)" }}>{tool.rating}</span>
          <span style={{ fontSize: 13, color: "var(--text2)" }}>{tool.upvote_count.toLocaleString()}</span>
          <span style={{
            display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600,
            padding: "3px 9px", borderRadius: 100,
            background: tool.is_published ? "var(--green-dim)" : "var(--bg3)",
            color: tool.is_published ? "var(--green)" : "var(--text3)",
            border: `1px solid ${tool.is_published ? "var(--green)" : "var(--border)"}`,
          }}>
            {tool.is_published ? "Published" : "Draft"}
          </span>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Link href={`/admin/tools/${tool.id}`} style={{
              padding: "5px 12px", borderRadius: 7, border: "1px solid var(--border2)",
              color: "var(--text2)", fontSize: 12, fontWeight: 500, textDecoration: "none",
            }}>Edit</Link>
            <button onClick={() => handleDelete(tool.id, tool.name)} style={{
              padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)",
              color: "var(--text3)", fontSize: 12, background: "transparent", cursor: "pointer",
            }}>Del</button>
          </div>
        </div>
      ))}
    </>
  );
}
