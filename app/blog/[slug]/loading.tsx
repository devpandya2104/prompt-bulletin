export default function BlogLoading() {
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
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ ...shimmer, height: 14, width: 120 }} />
          <div style={{ ...shimmer, height: 42, width: "85%" }} />
          <div style={{ ...shimmer, height: 42, width: "60%" }} />
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ ...shimmer, height: 36, width: 36, borderRadius: "50%" }} />
            <div style={{ ...shimmer, height: 16, width: 140 }} />
            <div style={{ ...shimmer, height: 16, width: 80 }} />
          </div>
          <div style={{ ...shimmer, height: 320, borderRadius: 16 }} />
          {[100, 95, 88, 100, 92, 78, 96, 90].map((w, i) => (
            <div key={i} style={{ ...shimmer, height: 16, width: `${w}%` }} />
          ))}
        </div>
      </div>
    </>
  );
}
