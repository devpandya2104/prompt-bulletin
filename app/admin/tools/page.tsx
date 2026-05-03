import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import ToolsTable from "@/components/admin/ToolsTable";

export const revalidate = 0;

export default async function AdminToolsPage() {
  const supabase = await createAdminClient();
  const { data: tools } = await supabase
    .from("tools")
    .select("id, name, slug, rating, upvote_count, is_published, categories(name)")
    .order("upvote_count", { ascending: false });

  const all = (tools ?? []) as unknown as {
    id: string; name: string; slug: string; rating: number;
    upvote_count: number; is_published: boolean;
    categories: { name: string } | null;
  }[];

  const published = all.filter((t) => t.is_published).length;

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-space)", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>Tools</h1>
          <p style={{ fontSize: 13, color: "var(--text3)", margin: "4px 0 0" }}>
            {published} published · {all.length - published} draft
          </p>
        </div>
        <Link href="/admin/tools/new" style={{
          padding: "9px 18px", borderRadius: 9, background: "var(--accent)",
          color: "#000", fontWeight: 700, fontSize: 13, textDecoration: "none",
          fontFamily: "var(--font-space)",
        }}>
          + New Tool
        </Link>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 80px 70px 90px 120px",
          background: "var(--bg3)", padding: "10px 20px", borderBottom: "1px solid var(--border)",
        }}>
          {["Name", "Category", "Rating", "Upvotes", "Status", ""].map((h) => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
          ))}
        </div>
        <ToolsTable tools={all} />
      </div>
    </div>
  );
}
