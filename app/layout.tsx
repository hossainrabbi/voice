import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Voice Wave | pmX Ai",
  description:
    "Record your voice with a live wave visualiser powered by your microphone",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#05060a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className="bg-[#05060a] text-slate-50 antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
