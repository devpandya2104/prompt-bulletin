"use client";
import { useState, useTransition } from "react";
import { updateSubmission } from "@/app/admin/actions";

type Submission = {
  id: string;
  name: string;
  url: string;
  submitter_email: string;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  categories: { name: string } | null;
};

const STATUS_COLOR: Record<string, string> = {
  pending:  "rgba(234,179,8,0.15)",
  approved: "rgba(34,197,94,0.15)",
  rejected: "rgba(239,68,68,0.15)",
};
const STATUS_TEXT: Record<string, string> = {
  pending:  "#eab308",
  approved: "#22c55e",
  rejected: "#ef4444",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
      padding: "3px 8px", borderRadius: 6,
      background: STATUS_COLOR[status] ?? "var(--bg3)",
      color: STATUS_TEXT[status] ?? "var(--text3)",
    }}>
      {status}
    </span>
  );
}

function SubmissionRow({ sub, onUpdate }: { sub: Submission; onUpdate: (id: string, status: string, notes: string) => Promise<void> }) {
  const [expanded, setExpanded]   = useState(false);
  const [status,   setStatus]     = useState(sub.status);
  const [notes,    setNotes]      = useState(sub.admin_notes ?? "");
  const [saving,   setSaving]     = useState(false);
  const [saved,    setSaved]      = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(sub.id, status, notes);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const date = new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        style={{ cursor: "pointer", borderBottom: "1px solid var(--border)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <td style={{ padding: "12px 16px" }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{sub.name}</div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{sub.categories?.name ?? "—"}</div>
        </td>
        <td style={{ padding: "12px 16px" }}>
          <a href={sub.url} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", fontFamily: "monospace" }}>
            {sub.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        </td>
        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text2)" }}>{sub.submitter_email}</td>
        <td style={{ padding: "12px 16px", fontSize: 11, color: "var(--text3)" }}>{date}</td>
        <td style={{ padding: "12px 16px" }}><StatusBadge status={sub.status} /></td>
        <td style={{ padding: "12px 16px", fontSize: 14, color: "var(--text3)", textAlign: "center" }}>
          {expanded ? "▲" : "▼"}
        </td>
      </tr>
      {expanded && (
        <tr style={{ borderBottom: "1px solid var(--border)" }}>
          <td colSpan={6} style={{ padding: "16px 24px", background: "var(--bg3)" }}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {sub.description && (
                <div style={{ flex: "1 1 300px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Description</p>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{sub.description}</p>
                </div>
              )}
              <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Status</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["pending", "approved", "rejected"] as const).map((s) => (
                      <button key={s} onClick={() => setStatus(s)}
                        style={{
                          padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                          border: status === s ? `1px solid ${STATUS_TEXT[s]}` : "1px solid var(--border)",
                          background: status === s ? STATUS_COLOR[s] : "transparent",
                          color: status === s ? STATUS_TEXT[s] : "var(--text3)",
                          textTransform: "capitalize",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Admin notes</p>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                    placeholder="Internal notes (not visible to submitter)…"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)", color: "var(--text)", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={handleSave} disabled={saving}
                    style={{ padding: "7px 18px", borderRadius: 8, background: "var(--accent)", color: "#000", border: "none", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                  {saved && <span style={{ fontSize: 12, color: "var(--green)" }}>✓ Saved</span>}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function SubmissionsManager({ initialData }: { initialData: Submission[] }) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [data,   setData]   = useState(initialData);
  const [, startTransition] = useTransition();

  const handleUpdate = async (id: string, status: string, notes: string) => {
    await updateSubmission(id, status, notes);
    setData((prev) => prev.map((s) => s.id === id ? { ...s, status: status as Submission["status"], admin_notes: notes } : s));
  };

  const filtered = filter === "all" ? data : data.filter((s) => s.status === filter);
  const counts = {
    all: data.length,
    pending:  data.filter((s) => s.status === "pending").length,
    approved: data.filter((s) => s.status === "approved").length,
    rejected: data.filter((s) => s.status === "rejected").length,
  };

  return (
    <div style={{ maxWidth: 1000, padding: "40px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-space)", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
          Tool Submissions
        </h1>
        <p style={{ fontSize: 13, color: "var(--text3)", margin: "4px 0 0" }}>
          Review and manage incoming tool submissions from the website
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg3)", padding: 4, borderRadius: 10, width: "fit-content" }}>
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: filter === f ? 600 : 400,
              background: filter === f ? "var(--bg2)" : "transparent",
              color: filter === f ? "var(--text)" : "var(--text2)",
              boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
              textTransform: "capitalize",
            }}>
            {f} <span style={{ fontSize: 10, opacity: 0.7 }}>({counts[f]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)", fontSize: 14 }}>
          No {filter === "all" ? "" : filter} submissions yet
        </div>
      ) : (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Tool", "URL", "Submitted by", "Date", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <SubmissionRow key={sub.id} sub={sub} onUpdate={handleUpdate} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
