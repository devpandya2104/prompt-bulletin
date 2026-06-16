import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const revalidate = 3600;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_COLORS: Record<string, string> = {
  "Deep Dive":  "#7c6af0",
  "Roundup":    "#e06f30",
  "Guide":      "#2ea87a",
  "News":       "#3a8fd1",
  "Opinion":    "#c94f7c",
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt, author_name, category, read_time, post_type")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  const title      = data?.title       ?? "PromptBulletin";
  const excerpt    = data?.excerpt     ?? "AI tools insights from the PromptBulletin editorial team.";
  const author     = data?.author_name ?? "PromptBulletin Editorial";
  const category   = data?.category   ?? null;
  const readTime   = data?.read_time  ?? null;
  const catColor   = category ? (CATEGORY_COLORS[category] ?? "#7c6af0") : "#7c6af0";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#111114",
          padding: "60px 72px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top — category badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {category && (
            <div
              style={{
                backgroundColor: catColor + "22",
                border: `1.5px solid ${catColor}55`,
                borderRadius: 8,
                padding: "6px 16px",
                color: catColor,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              {category}
            </div>
          )}
          {readTime && (
            <span style={{ color: "#ffffff40", fontSize: 15 }}>{readTime} min read</span>
          )}
        </div>

        {/* Center — title + excerpt */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: 1000 }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: title.length > 60 ? 44 : title.length > 40 ? 52 : 60,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
            }}
          >
            {title.length > 80 ? title.slice(0, 78) + "…" : title}
          </div>
          {excerpt && (
            <div
              style={{
                color: "#ffffff60",
                fontSize: 22,
                lineHeight: 1.45,
              }}
            >
              {excerpt.length > 120 ? excerpt.slice(0, 118) + "…" : excerpt}
            </div>
          )}
        </div>

        {/* Bottom — author + branding */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: catColor + "33",
                border: `1.5px solid ${catColor}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: catColor,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {author.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <span style={{ color: "#ffffffcc", fontSize: 17, fontWeight: 500 }}>{author}</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#ffffff", fontSize: 20, fontWeight: 700 }}>✦</span>
            <span style={{ color: "#ffffff90", fontSize: 18, fontWeight: 600 }}>PromptBulletin</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
