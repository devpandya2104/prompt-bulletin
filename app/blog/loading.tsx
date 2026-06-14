export default function BlogIndexLoading() {
  const shimmer: React.CSSProperties = {
    background: "linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: 10,
  };

  return (
    <>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
      <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 80, padding: "100px 24px 60px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ ...shimmer, height: 36, width: 200, marginBottom: 40 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, background: "var(--bg2)", borderRadius: 16, border: "1px solid var(--border)" }}>
                <div style={{ ...shimmer, height: 180, borderRadius: 10 }} />
                <div style={{ ...shimmer, height: 14, width: "40%" }} />
                <div style={{ ...shimmer, height: 22, width: "90%" }} />
                <div style={{ ...shimmer, height: 22, width: "70%" }} />
                <div style={{ ...shimmer, height: 16, width: "55%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
