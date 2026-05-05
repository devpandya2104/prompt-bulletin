"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthModal from "./AuthModal";
import type { User } from "@supabase/supabase-js";
import type { NavbarConfig } from "@/lib/site-config";
import { DEFAULT_NAVBAR } from "@/lib/site-config";

export default function Navbar({ config = DEFAULT_NAVBAR }: { config?: NavbarConfig }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuth,   setShowAuth]   = useState(false);
  const [user,       setUser]       = useState<User | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    const onOpenAuth = () => setShowAuth(true);
    window.addEventListener("open-auth", onOpenAuth);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("open-auth", onOpenAuth); };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300"
        style={{ borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent", background: scrolled ? "rgba(10,10,11,0.92)" : "transparent", backdropFilter: scrolled ? "blur(16px)" : "none" }}>
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="var(--accent)"/>
              <path d="M19 14L19.9 16.1L22 17L19.9 17.9L19 20L18.1 17.9L16 17L18.1 16.1L19 14Z" fill="var(--accent)" opacity="0.5"/>
              <path d="M5 3L5.7 4.8L7.5 5.5L5.7 6.2L5 8L4.3 6.2L2.5 5.5L4.3 4.8L5 3Z" fill="var(--accent)" opacity="0.5"/>
            </svg>
            <span className="font-bold text-[17px] tracking-tight"
              style={{ fontFamily: "var(--font-space)", color: "var(--text)" }}>
              {config.logoName}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {config.links.map((link) => {
              const isCTA = link === config.links[config.links.length - 1];
              return (
                <a key={link.label} href={link.href}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 no-underline"
                  style={{ color: isCTA ? "var(--accent)" : "var(--text2)", border: isCTA ? "1px solid var(--accent-dim)" : "1px solid transparent" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = isCTA ? "var(--accent)" : "var(--text2)"; e.currentTarget.style.background = "transparent"; }}>
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Auth area */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="hidden md:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent)" }}>{initials}</div>
                <button onClick={handleSignOut}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all"
                  style={{ border: "1px solid var(--border2)", color: "var(--text2)", background: "transparent" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text2)"; }}>Sign out</button>
              </div>
            ) : (
              <>
                <button onClick={() => setShowAuth(true)}
                  className="hidden md:block px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all"
                  style={{ border: "1px solid var(--border2)", color: "var(--text2)", background: "transparent" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "var(--border2)"; }}>
                  Log in
                </button>
                <button onClick={() => setShowAuth(true)}
                  className="hidden md:block px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-opacity hover:opacity-85"
                  style={{ background: "var(--accent)", color: "#000", border: "none" }}>
                  Sign up free
                </button>
              </>
            )}
            <button className="md:hidden p-1 bg-transparent border-0 cursor-pointer"
              style={{ color: "var(--text2)" }} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden px-6 pb-6 pt-0" style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)" }}>
            {config.links.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                className="block py-3 text-[15px] font-medium no-underline"
                style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
                {link.label}
              </a>
            ))}
            <div className="flex gap-2.5 mt-4">
              {user ? (
                <button onClick={handleSignOut} className="flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
                  style={{ border: "1px solid var(--border2)", color: "var(--text2)", background: "transparent" }}>Sign out</button>
              ) : (
                <>
                  <button onClick={() => { setMobileOpen(false); setShowAuth(true); }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
                    style={{ border: "1px solid var(--border2)", color: "var(--text2)", background: "transparent" }}>Log in</button>
                  <button onClick={() => { setMobileOpen(false); setShowAuth(true); }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold cursor-pointer"
                    style={{ background: "var(--accent)", color: "#000", border: "none" }}>Sign up free</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
