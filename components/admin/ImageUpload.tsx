"use client";
import { useState, useRef } from "react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export default function ImageUpload({ value, onChange, folder = "misc", label = "Image" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("File must be under 10 MB"); return; }
    setUploading(true);
    setProgress(0);
    setError("");
    try {
      // 1. Request a presigned URL from our API
      const res = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, fileName: file.name, contentType: file.type }),
      });
      if (!res.ok) {
        const { error: e } = await res.json().catch(() => ({ error: "Failed to get upload URL" }));
        throw new Error(e ?? "Failed to get upload URL");
      }
      const { uploadUrl, publicUrl } = await res.json() as { uploadUrl: string; publicUrl: string };

      // 2. Upload directly to R2 via presigned PUT
      setProgress(30);
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error("Upload to storage failed");

      setProgress(100);
      onChange(publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)" }}>{label}</label>}

      {value && (
        <div style={{ position: "relative", width: "fit-content" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 8, border: "1px solid var(--border)", objectFit: "cover" }} />
          <button onClick={() => onChange("")}
            style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", fontSize: 14, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ×
          </button>
        </div>
      )}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          padding: "20px 16px", border: "2px dashed var(--border2)", borderRadius: 10,
          textAlign: "center", cursor: uploading ? "default" : "pointer",
          background: "var(--bg3)", transition: "border-color 0.15s", position: "relative", overflow: "hidden",
        }}
        onMouseEnter={(e) => { if (!uploading) (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"}
      >
        {/* Progress bar */}
        {uploading && progress > 0 && (
          <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: `${progress}%`, background: "var(--accent)", transition: "width 0.3s", borderRadius: "0 2px 2px 0" }} />
        )}
        {uploading ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--text3)" }}>
            {progress < 30 ? "Preparing…" : progress < 100 ? "Uploading to CDN…" : "Processing…"}
          </p>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>Click or drag to upload</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text3)" }}>JPG, PNG, WebP, SVG, GIF · max 10 MB</p>
          </>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />

      {error && <p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>{error}</p>}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--text3)" }}>Or paste URL:</span>
        <input type="url" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          style={{ flex: 1, padding: "6px 10px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border2)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "var(--font-inter)" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border2)")} />
      </div>

      {value && (
        <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "6px 10px", background: "var(--bg3)", borderRadius: 8, border: "1px solid var(--border)" }}>
          <span style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0 }}>CDN URL:</span>
          <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
          <button
            onClick={() => navigator.clipboard.writeText(value)}
            style={{ marginLeft: "auto", flexShrink: 0, fontSize: 11, padding: "2px 8px", borderRadius: 5, border: "1px solid var(--border2)", background: "transparent", color: "var(--text3)", cursor: "pointer" }}>
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
