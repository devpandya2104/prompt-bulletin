"use client";
import { useState, useTransition } from "react";
import { deleteNewsletterSubscriber } from "@/app/admin/actions";

type Subscriber = {
  id: string;
  email: string;
  created_at: string;
};

export default function NewsletterList({ initialData }: { initialData: Subscriber[] }) {
  const [subs,    setSubs]    = useState(initialData);
  const [copied,  setCopied]  = useState(false);
  const [search,  setSearch]  = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = search.trim()
    ? subs.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()))
    : subs;

  const copyAll = () => {
    navigator.clipboard.writeText(subs.map((s) => s.email).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    setDeleting(id);
    startTransition(async () => {
      await deleteNewsletterSubscriber(id);
      setSubs((prev) => prev.filter((s) => s.id !== id));
      setDeleting(null);
    });
  };

  return (
    <div style={{ maxWidth: 800, padding: "40px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-space)", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
          Newsletter Subscribers
        </h1>
        <p style={{ fontSize: 13, color: "var(--text3)", margin: "4px 0 0" }}>
          {subs.length} subscriber{subs.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Stats + actions bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 18px", display: "flex", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-space)" }}>{subs.length}</div>
            <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</div>
          </div>
          <div style={{ width: 1, background: "var(--border)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-space)" }}>
              {subs.filter((s) => {
                const d = new Date(s.created_at);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>This month</div>
          </div>
        </div>

        <button onClick={copyAll}
          style={{ padding: "9px 18px", borderRadius: 9, border: "1px solid var(--border2)", background: "transparent", color: copied ? "var(--green)" : "var(--text2)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          {copied ? "✓ Copied!" : "Copy all emails"}
        </button>

        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by email…"
          style={{ padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)", color: "var(--text)", fontSize: 13, outline: "none", minWidth: 200 }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)", fontSize: 14 }}>
          {search ? "No subscribers match that email" : "No subscribers yet"}
        </div>
      ) : (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Email", "Subscribed", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text)", fontFamily: "monospace" }}>{sub.email}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text3)" }}>
                    {new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button onClick={() => handleDelete(sub.id)} disabled={deleting === sub.id}
                      style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--red)", cursor: "pointer", fontSize: 12, opacity: deleting === sub.id ? 0.5 : 1 }}>
                      {deleting === sub.id ? "…" : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
