"use client";
import { useState } from "react";
import { updateUserRole } from "@/app/admin/actions";

interface Profile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const ROLES = ["user", "editor", "admin"] as const;

const roleColors: Record<string, string> = {
  admin: "var(--accent)",
  editor: "#60a5fa",
  user: "var(--text3)",
};

export default function TeamManager({ profiles }: { profiles: Profile[] }) {
  const [list, setList] = useState(profiles);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const filtered = list.filter(p =>
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (id: string, role: string) => {
    setSaving(id);
    setError("");
    try {
      await updateUserRole(id, role);
      setList(prev => prev.map(p => p.id === id ? { ...p, role } : p));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setSaving(null);
    }
  };

  const roleCounts = ROLES.map(r => ({ role: r, count: list.filter(p => p.role === r).length }));

  return (
    <div style={{ padding: "32px 40px", maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Team</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-space)", letterSpacing: "-0.02em", margin: 0 }}>User Management</h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {roleCounts.map(({ role, count }) => (
          <div key={role} style={{ padding: "16px 20px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12 }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text3)", textTransform: "capitalize" }}>{role}s</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: roleColors[role], fontFamily: "var(--font-space)" }}>{count}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email or role…"
          style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 8, background: "var(--bg2)", border: "1px solid var(--border2)", color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "var(--font-inter)" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
      </div>

      {error && <p style={{ fontSize: 13, color: "#ef4444", marginBottom: 12 }}>{error}</p>}

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Email", "Joined", "Role", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "var(--text3)", fontSize: 14 }}>No users found</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text)", fontFamily: "var(--font-inter)" }}>{p.email}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text3)" }}>
                  {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: `${roleColors[p.role]}18`, color: roleColors[p.role], textTransform: "capitalize" }}>
                    {p.role}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {ROLES.filter(r => r !== p.role).map(r => (
                      <button key={r} onClick={() => handleRoleChange(p.id, r)} disabled={saving === p.id}
                        style={{ padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: saving === p.id ? "default" : "pointer", background: "transparent", border: `1px solid ${roleColors[r]}40`, color: roleColors[r], opacity: saving === p.id ? 0.5 : 1, transition: "all 0.15s", fontFamily: "var(--font-inter)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${roleColors[r]}18`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                        → {r}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 12, fontSize: 12, color: "var(--text3)" }}>
        {filtered.length} of {list.length} users shown
      </p>
    </div>
  );
}
