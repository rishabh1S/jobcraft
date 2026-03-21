import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
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
  title: "JobCraft — AI Resume Tailor",
  description: "Track job applications and tailor your resume with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        <div className="fixed inset-0 -z-10" style={{ background: "var(--gradient)" }} />
        <ThemeProvider>
        <SessionProviderWrapper>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--surface-elevated)",
              color: "var(--foreground)",
              border: "1px solid var(--border-strong)",
              fontSize: "13px",
              fontFamily: "inherit",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#080808" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#080808" },
            },
          }}
        />
        </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
