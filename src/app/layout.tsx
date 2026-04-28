import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Providers";
import { Header } from "@/components/layout/Header";

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
        <Providers>
          <Header />
          <main className="px-4 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
