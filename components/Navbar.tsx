"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/UserMenu";

interface NavbarProps {
  processingCount?: number;
}

export function Navbar({ processingCount = 0 }: NavbarProps) {
  const { data: session } = useSession();
  const activeCount = processingCount;
  const user = session?.user;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6"
      style={{
        background: "var(--navbar-bg)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <span className="font-mono font-semibold text-sm tracking-tight" style={{ color: "var(--foreground)" }}>
          JobCraft
        </span>
      </Link>

      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-4">
        {activeCount > 0 && (
          <span
            className="font-mono text-xs px-2.5 py-1 rounded-full"
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-strong)",
              color: "var(--accent)",
            }}
          >
            {activeCount} processing
          </span>
        )}

        {user && <UserMenu user={user} />}
      </div>
    </nav>
  );
}
