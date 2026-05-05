"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const contentItems = [
  { label: "Tools",      href: "/admin/tools",      icon: "⚙" },
  { label: "Blog Posts", href: "/admin/blog",        icon: "✍" },
  { label: "Categories", href: "/admin/categories",  icon: "📂" },
];

const siteItems = [
  { label: "Homepage",        href: "/admin/homepage",      icon: "🏠" },
  { label: "Header & Footer", href: "/admin/header-footer", icon: "🔗" },
];

const inboxItems = [
  { label: "Tool Submissions", href: "/admin/submissions", icon: "📥" },
  { label: "Newsletter",       href: "/admin/newsletter",  icon: "✉" },
];

const seoItems = [
  { label: "SEO", href: "/admin/seo", icon: "🔍" },
];

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
      borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 500,
      color: active ? "var(--text)" : "var(--text2)", marginBottom: 2,
      background: active ? "rgba(255,255,255,0.06)" : "transparent",
      transition: "all 0.15s",
    }}
    onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; } }}
    onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text2)"; } }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </Link>
  );
}

export default function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, background: "var(--bg2)",
        borderRight: "1px solid var(--border)", display: "flex",
        flexDirection: "column", position: "fixed",
        top: 0, left: 0, bottom: 0, zIndex: 50,
      }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="var(--accent)"/>
              <path d="M19 14L19.9 16.1L22 17L19.9 17.9L19 20L18.1 17.9L16 17L18.1 16.1L19 14Z" fill="var(--accent)" opacity="0.5"/>
              <path d="M5 3L5.7 4.8L7.5 5.5L5.7 6.2L5 8L4.3 6.2L2.5 5.5L4.3 4.8L5 3Z" fill="var(--accent)" opacity="0.5"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-space)", color: "var(--text)" }}>Admin</span>
          </Link>
        </div>

        <nav style={{ padding: "12px 10px", flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 10px", marginBottom: 6 }}>Content</p>
          {contentItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <div style={{ margin: "12px 0 6px", borderTop: "1px solid var(--border)" }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "6px 10px", marginBottom: 6 }}>Design</p>
          {siteItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <div style={{ margin: "12px 0 6px", borderTop: "1px solid var(--border)" }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "6px 10px", marginBottom: 6 }}>Inbox</p>
          {inboxItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <div style={{ margin: "12px 0 6px", borderTop: "1px solid var(--border)" }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "6px 10px", marginBottom: 6 }}>SEO</p>
          {seoItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <div style={{ margin: "12px 0 6px", borderTop: "1px solid var(--border)" }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "6px 10px", marginBottom: 6 }}>Site</p>
          <Link href="/" target="_blank" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
            borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 500,
            color: "var(--text2)", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text2)"; }}>
            <span style={{ fontSize: 14 }}>↗</span>
            View Site
          </Link>
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
