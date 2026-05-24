import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutcracker — Auto Documentation Generator",
  description: "Paste a GitHub URL or upload code files. Get precise technical docs in seconds.",
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}