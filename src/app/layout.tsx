import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorHandler } from "@/components/error-handler";
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
  title: "Astra Academy - Homeschool Worksheet Builder",
  description:
    "Create custom worksheets, track progress, and make learning fun with our intuitive worksheet builder designed specifically for homeschooling parents. By Wyatt Works.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/astra-academy-icon.svg", type: "image/svg+xml", sizes: "192x192" },
    ],
    apple: "/astra-academy-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ErrorHandler />
          <ErrorBoundary>{children}</ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
