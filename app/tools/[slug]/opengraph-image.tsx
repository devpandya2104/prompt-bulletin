import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const revalidate = 3600;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("tools")
    .select("name, tagline, rating, pricing, editor_rating")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  const name    = data?.name    ?? "AI Tool Review";
  const tagline = data?.tagline ?? "Discover the best AI tools at PromptBulletin";
  const rating  = data?.editor_rating ? (data.editor_rating / 2).toFixed(1) : null;
  const pricing = data?.pricing ?? null;

  const stars = rating
    ? Array.from({ length: 5 }, (_, i) => (i + 0.5 < parseFloat(rating) ? "★" : "☆")).join("")
    : null;

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
        {/* Top row — branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: "#1a1a1f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            ✦
          </div>
          <span style={{ color: "#ffffff", fontSize: 22, fontWeight: 600, letterSpacing: "-0.3px" }}>
            PromptBulletin
          </span>
          <span style={{ color: "#ffffff30", fontSize: 22 }}>·</span>
          <span style={{ color: "#ffffff60", fontSize: 18 }}>AI Tool Review</span>
        </div>

        {/* Center — tool name + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: name.length > 24 ? 56 : 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            {name}
          </div>
          <div
            style={{
              color: "#ffffff80",
              fontSize: 26,
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: 900,
              overflow: "hidden",
              display: "-webkit-box",
            }}
          >
            {tagline}
          </div>
        </div>

        {/* Bottom row — rating + pricing */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {stars && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#1e1e24",
                borderRadius: 10,
                padding: "10px 18px",
              }}
            >
              <span style={{ color: "#f0a030", fontSize: 22, letterSpacing: 2 }}>{stars}</span>
              <span style={{ color: "#ffffff", fontSize: 18, fontWeight: 700 }}>{rating}</span>
              <span style={{ color: "#ffffff50", fontSize: 16 }}>/ 5</span>
            </div>
          )}
          {pricing && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#1e1e24",
                borderRadius: 10,
                padding: "10px 18px",
              }}
            >
              <span style={{ color: "#ffffff90", fontSize: 17 }}>{pricing}</span>
            </div>
          )}
          <div style={{ flex: 1 }} />
          <span style={{ color: "#ffffff30", fontSize: 16 }}>promptbulletin.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
