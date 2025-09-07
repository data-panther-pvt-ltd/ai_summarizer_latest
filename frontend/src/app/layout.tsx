import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Summarizer",
  description: "Summarize text, files, and URLs with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
          <header className="border-b border-border/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">

                <span className="font-semibold tracking-tight">AI Summarizer</span>
              </div>

            </div>
          </header>
          <main className="mx-auto max-w-5xl w-full px-6 py-10">{children}</main>
          <footer className="border-t border-border/60">
            <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-muted-foreground">
              copyright@datapanther
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
