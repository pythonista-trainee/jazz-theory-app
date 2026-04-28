import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jazz Theory Lab",
  description: "Jazz chord, scale & lick trainer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-jazz-bg text-jazz-text antialiased">
        <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">🎷</span>
          <h1 className="text-xl font-black text-jazz-gold tracking-tight">
            Jazz Theory Lab
          </h1>
          <nav className="ml-auto flex gap-1">
            {[
              { href: "/", label: "Chord Master" },
              { href: "/scale-matcher", label: "Scale Matcher" },
              { href: "/lick-generator", label: "Lick Generator" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="px-4 py-2 text-sm text-jazz-muted hover:text-jazz-text hover:bg-white/5 rounded-lg transition-all"
              >
                {label}
              </a>
            ))}
          </nav>
        </header>
        <main className="px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
