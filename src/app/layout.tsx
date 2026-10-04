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
  title: "PostFlow | Social content planning and publishing workspace",
  description: "PostFlow helps teams plan social content, manage media and reviews, schedule posts, and connect supported social accounts.",
  metadataBase: new URL("https://postflow.taskflow.monster"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "PostFlow | Social content planning and publishing workspace",
    description: "Plan social content, manage media and reviews, schedule posts, and connect supported social accounts with PostFlow.",
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
