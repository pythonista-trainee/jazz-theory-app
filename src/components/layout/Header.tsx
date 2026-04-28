"use client";

import { InstrumentSelector } from "@/components/ui/InstrumentSelector";

const NAV = [
  { href: "/", label: "Chord Master" },
  { href: "/scale-matcher", label: "Scale Matcher" },
  { href: "/lick-generator", label: "Lick Generator" },
];

export function Header() {
  return (
    <header className="border-b border-white/10 px-4 py-3 flex items-center gap-3">
      <span className="text-2xl">🎷</span>
      <h1 className="text-xl font-black text-jazz-gold tracking-tight">
        Jazz Theory Lab
      </h1>
      <nav className="ml-auto flex items-center gap-1">
        {NAV.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="px-3 py-2 text-sm text-jazz-muted hover:text-jazz-text hover:bg-white/5 rounded-lg transition-all hidden sm:block"
          >
            {label}
          </a>
        ))}
        <div className="ml-2 pl-2 border-l border-white/10">
          <InstrumentSelector />
        </div>
      </nav>
    </header>
  );
}
