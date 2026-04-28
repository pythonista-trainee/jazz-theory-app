"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstrumentSelector } from "@/components/ui/InstrumentSelector";

const NAV = [
  { href: "/",                label: "Chord",  emoji: "🎵" },
  { href: "/scale-matcher",   label: "Scale",  emoji: "🎼" },
  { href: "/lick-generator",  label: "Lick",   emoji: "🎷" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop/tablet header ─────────────────────────────── */}
      <header className="border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">🎷</span>
        <h1 className="text-xl font-black text-jazz-gold tracking-tight">
          Jazz Theory Lab
        </h1>
        <nav className="ml-auto hidden sm:flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 text-sm rounded-lg transition-all ${
                pathname === href
                  ? "text-jazz-gold bg-white/5 font-semibold"
                  : "text-jazz-muted hover:text-jazz-text hover:bg-white/5"
              }`}
            >
              {label} Master
            </Link>
          ))}
        </nav>
        <div className="ml-auto sm:ml-2 sm:pl-2 sm:border-l border-white/10">
          <InstrumentSelector />
        </div>
      </header>

      {/* ── Mobile bottom tab bar ─────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-jazz-card/95 backdrop-blur border-t border-white/10 flex justify-around safe-area-inset-bottom">
        {NAV.map(({ href, label, emoji }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-6 py-3 flex-1 transition-all ${
                active ? "text-jazz-gold" : "text-jazz-muted"
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-xs font-semibold">{label}</span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-jazz-accent mt-0.5" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
