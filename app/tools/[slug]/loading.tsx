export default function ToolLoading() {
  const shimmer: React.CSSProperties = {
    background: "linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: 10,
  };

  return (
    <>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
      <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>
          {/* Main */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ ...shimmer, height: 32, width: "60%" }} />
            <div style={{ ...shimmer, height: 20, width: "40%" }} />
            <div style={{ display: "flex", gap: 8 }}>
              {[80, 60, 100, 70].map((w, i) => <div key={i} style={{ ...shimmer, height: 28, width: w }} />)}
            </div>
            <div style={{ ...shimmer, height: 200, width: "100%", borderRadius: 16 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[100, 90, 95, 85, 92].map((w, i) => <div key={i} style={{ ...shimmer, height: 16, width: `${w}%` }} />)}
            </div>
          </div>
          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...shimmer, height: 160, borderRadius: 16 }} />
            <div style={{ ...shimmer, height: 120, borderRadius: 16 }} />
          </div>
        </div>
      </div>
    </>
  );
}
