import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lift Metrics",
  description: "Analyze your workout data — 1RM prediction, volume, PRs",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${outfit.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-10 shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 h-16 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm">
            <Link href="/" className="flex items-center gap-2.5 font-heading font-bold text-base tracking-tight text-gray-800 hover:text-gray-600 transition-colors">
              <span className="flex items-center justify-center shrink-0" aria-hidden>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <path d="M3 12h18" />
                  <circle cx="4" cy="12" r="3" />
                  <circle cx="20" cy="12" r="3" />
                </svg>
              </span>
              Lift Metrics
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Analyze
              </Link>
              <Link
                href="/purpose"
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Purpose
              </Link>
            </nav>
          </header>
          <main className="flex-1 overflow-auto bg-[var(--bg-main)] min-h-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
