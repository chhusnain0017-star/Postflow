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
  title: "PostFlow | Multi-publisher SaaS",
  description: "Upload once and publish across social channels through approved customer accounts.",
  metadataBase: new URL("https://postflow.taskflow.monster"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "PostFlow | Multi-publisher SaaS",
    description: "Plan and manage social publishing across approved customer accounts.",
    url: "https://postflow.taskflow.monster",
    siteName: "PostFlow",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
