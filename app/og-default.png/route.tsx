import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0a0a0f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse 900px 400px at 50% -10%, rgba(245,176,55,0.18) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
          <div
            style={{
              width: 60,
              height: 60,
              background: "rgba(245,176,55,0.12)",
              border: "1.5px solid rgba(245,176,55,0.45)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: 46,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-1.5px",
            }}
          >
            PromptBulletin
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.55)",
            margin: 0,
            textAlign: "center",
            maxWidth: 680,
            lineHeight: 1.5,
          }}
        >
          Discover the best AI tools — editorial reviews, community votes &amp; structured comparisons
        </p>

        {/* Domain */}
        <div style={{ position: "absolute", bottom: 44, display: "flex" }}>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>
            promptbulletin.com
          </span>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(245,176,55,0.9) 50%, transparent 100%)",
            display: "flex",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
