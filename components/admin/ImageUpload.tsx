"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export default function ImageUpload({ value, onChange, folder = "misc", label = "Image" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("File must be under 5 MB"); return; }
    setUploading(true);
    setError("");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: err } = await supabase.storage.from("images").upload(path, file, { upsert: false });
      if (err) { setError(err.message); return; }
      const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(path);
      onChange(publicUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)" }}>{label}</label>

      {value && (
        <div style={{ position: "relative", width: "fit-content" }}>
          <img src={value} alt="Preview" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 8, border: "1px solid var(--border)", objectFit: "cover" }} />
          <button onClick={() => onChange("")} style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", fontSize: 14, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ padding: "20px 16px", border: "2px dashed var(--border2)", borderRadius: 10, textAlign: "center", cursor: "pointer", background: "var(--bg3)", transition: "border-color 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
      >
        {uploading ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--text3)" }}>Uploading…</p>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>Click or drag to upload</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text3)" }}>JPG, PNG, WebP, SVG · max 5 MB</p>
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
    </div>
  );
}
