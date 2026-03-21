import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ background: "#080808" }}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#f0ede8",
              border: "1px solid #2a2a2a",
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
      </body>
    </html>
  );
}
