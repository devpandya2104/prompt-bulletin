"use client";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useEffect } from "react";

// ── Inject IDs into h2/h3 so TOC can anchor to them ───────────────
export function addHeadingIds(html: string): string {
  const seen = new Set<string>();
  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/gi, (_, level, inner) => {
    const text = inner.replace(/<[^>]*>/g, "");
    let id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
    if (!id) id = `heading-${Math.random().toString(36).slice(2, 7)}`;
    let finalId = id;
    let n = 1;
    while (seen.has(finalId)) finalId = `${id}-${n++}`;
    seen.add(finalId);
    return `<h${level} id="${finalId}">${inner}</h${level}>`;
  });
}

// ── Extract TOC entries from richtext HTML ─────────────────────────
export function extractTocFromHtml(html: string): { id: string; text: string }[] {
  const entries: { id: string; text: string }[] = [];
  const regex = /<h2[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h2>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    entries.push({ id: m[1], text: m[2].replace(/<[^>]*>/g, "") });
  }
  return entries;
}

// ── Toolbar button ─────────────────────────────────────────────────
function TBtn({ onClick, active, title, children }: {
  onClick: () => void; active?: boolean; title?: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => { e.preventDefault(); onClick(); }}
      style={{
        padding: "4px 8px", borderRadius: 5, fontSize: 12, fontWeight: 600, lineHeight: 1.5,
        minWidth: 28, cursor: "pointer", transition: "all 0.1s",
        background: active ? "var(--accent-dim)" : "transparent",
        border: `1px solid ${active ? "var(--accent)" : "transparent"}`,
        color: active ? "var(--accent)" : "var(--text2)",
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div style={{ width: 1, height: 18, background: "var(--border2)", margin: "0 3px", flexShrink: 0 }} />;
}

// ── Link panel ─────────────────────────────────────────────────────
function LinkPanel({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const hasLink = editor.isActive("link");

  const handleOpen = () => {
    setUrl(editor.getAttributes("link").href ?? "");
    setOpen(true);
  };

  const apply = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({
        href: trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
        target: "_blank",
        rel: "noopener noreferrer",
      }).run();
    }
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <TBtn onClick={handleOpen} active={hasLink} title="Insert / edit link (Ctrl+K)">🔗</TBtn>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 100,
            background: "var(--bg3)", border: "1px solid var(--border2)",
            borderRadius: 10, padding: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            minWidth: 300, display: "flex", flexDirection: "column", gap: 8,
          }}>
            <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Link URL</p>
            <input
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") apply(); if (e.key === "Escape") setOpen(false); }}
              placeholder="https://example.com"
              style={{
                background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 6,
                padding: "7px 10px", color: "var(--text)", fontSize: 13, outline: "none",
                width: "100%", boxSizing: "border-box" as const,
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border2)")}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={apply} type="button" style={{ flex: 1, padding: "6px 0", borderRadius: 6, background: "var(--accent)", border: "none", color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {hasLink ? "Update" : "Insert"} link
              </button>
              {hasLink && (
                <button onClick={() => { editor.chain().focus().unsetLink().run(); setOpen(false); }} type="button"
                  style={{ padding: "6px 10px", borderRadius: 6, background: "var(--red-dim)", border: "1px solid var(--red)", color: "var(--red)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Remove
                </button>
              )}
              <button onClick={() => setOpen(false)} type="button"
                style={{ padding: "6px 10px", borderRadius: 6, background: "transparent", border: "1px solid var(--border2)", color: "var(--text3)", fontSize: 12, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Toolbar ────────────────────────────────────────────────────────
function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const c = editor.chain().focus();
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
      padding: "7px 10px", borderBottom: "1px solid var(--border2)",
      background: "var(--bg3)", borderRadius: "10px 10px 0 0",
    }}>
      <TBtn onClick={() => c.toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)"><strong>B</strong></TBtn>
      <TBtn onClick={() => c.toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)"><em style={{ fontStyle: "italic" }}>I</em></TBtn>
      <TBtn onClick={() => c.toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)"><span style={{ textDecoration: "underline" }}>U</span></TBtn>
      <TBtn onClick={() => c.toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><span style={{ textDecoration: "line-through" }}>S</span></TBtn>
      <TBtn onClick={() => c.toggleCode().run()} active={editor.isActive("code")} title="Inline code"><code style={{ fontFamily: "monospace", fontSize: 11 }}>`c`</code></TBtn>
      <Sep />
      <TBtn onClick={() => c.toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</TBtn>
      <TBtn onClick={() => c.toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">H3</TBtn>
      <Sep />
      <TBtn onClick={() => c.toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">• List</TBtn>
      <TBtn onClick={() => c.toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list">1. List</TBtn>
      <Sep />
      <TBtn onClick={() => c.toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">&ldquo; Quote</TBtn>
      <TBtn onClick={() => c.toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block"><code style={{ fontSize: 10 }}>{"{ }"}</code></TBtn>
      <Sep />
      <LinkPanel editor={editor} />
      <Sep />
      <TBtn onClick={() => c.setHorizontalRule().run()} title="Horizontal rule">─ Rule</TBtn>
      <TBtn onClick={() => c.clearNodes().unsetAllMarks().run()} title="Clear all formatting">✕ Clear</TBtn>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your article… Use the toolbar above for headings, links, lists, and formatting.",
  minHeight = 420,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const editor = useEditor({
    autofocus: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false, underline: false }),
      LinkExtension.configure({ openOnClick: false, linkOnPaste: true }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "pb-rte" } },
  });

  // Sync content if parent changes (e.g., switching posts)
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const current = editor.getHTML();
      if (value !== current) editor.commands.setContent(value || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return (
    <div style={{ border: "1px solid var(--border2)", borderRadius: 10, overflow: "hidden" }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} style={{ minHeight }} />
    </div>
  );
}
