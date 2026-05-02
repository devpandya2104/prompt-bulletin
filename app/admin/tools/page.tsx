import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { deleteTool } from "../actions";

export const revalidate = 0;

export default async function AdminToolsPage() {
  const supabase = await createAdminClient();
  const { data: tools } = await supabase
    .from("tools")
    .select("id, name, slug, pricing, rating, upvote_count, is_published, badge, categories(name)")
    .order("upvote_count", { ascending: false });

  const all = tools ?? [];
  const published = all.filter((t) => t.is_published).length;

  return (
    <div style={{ padding: "40px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-space)", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>Tools</h1>
          <p style={{ fontSize: 13, color: "var(--text3)", margin: "4px 0 0" }}>{published} published · {all.length - published} draft</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/admin/tools/new"
            style={{ padding: "9px 18px", borderRadius: 9, background: "var(--accent)", color: "#000", fontWeight: 700, fontSize: 13, textDecoration: "none", fontFamily: "var(--font-space)" }}>
            + New Tool
          </Link>
        </div>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 70px 90px 120px", background: "var(--bg3)", padding: "10px 20px", borderBottom: "1px solid var(--border)" }}>
          {["Name", "Category", "Rating", "Upvotes", "Status", ""].map((h) => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
          ))}
        </div>

        {all.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text3)" }}>No tools yet. Add your first one.</p>
          </div>
        )}

        {all.map((tool, i) => (
          <div key={tool.id} style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 80px 70px 90px 120px",
            padding: "14px 20px", alignItems: "center",
            borderBottom: i < all.length - 1 ? "1px solid var(--border)" : "none",
            background: i % 2 === 0 ? "var(--bg2)" : "transparent",
          }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{tool.name}</span>
              <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 8 }}>{tool.slug}</span>
            </div>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>
              {(tool.categories as unknown as { name: string } | null)?.name ?? "—"}
            </span>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>{tool.rating}</span>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>{tool.upvote_count.toLocaleString()}</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600,
              padding: "3px 9px", borderRadius: 100,
              background: tool.is_published ? "var(--green-dim)" : "var(--bg3)",
              color: tool.is_published ? "var(--green)" : "var(--text3)",
              border: `1px solid ${tool.is_published ? "var(--green)" : "var(--border)"}`,
            }}>
              {tool.is_published ? "Published" : "Draft"}
            </span>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Link href={`/admin/tools/${tool.id}`}
                style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid var(--border2)", color: "var(--text2)", fontSize: 12, fontWeight: 500, textDecoration: "none", transition: "all 0.15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text2)")}>
                Edit
              </Link>
              <form action={async () => {
                "use server";
                await deleteTool(tool.id);
              }}>
                <button type="submit"
                  style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid transparent", color: "var(--text3)", fontSize: 12, background: "transparent", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--red)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text3)"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}>
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
