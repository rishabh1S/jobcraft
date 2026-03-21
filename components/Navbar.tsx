"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Job } from "@/lib/types";
import { Avatar } from "@/components/Avatar";

interface NavbarProps {
  jobs?: Job[];
}

export function Navbar({ jobs = [] }: NavbarProps) {
  const { data: session } = useSession();
  const activeCount = jobs.filter((j) => j.status === "processing").length;
  const user = session?.user;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6"
      style={{
        background: "rgba(8,8,8,0.92)",
        borderBottom: "1px solid #1f1f1f",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "#f0ede8",
            boxShadow: "0 0 12px rgba(240,237,232,0.15)",
          }}
        >
          <span className="font-bold text-xs tracking-tight" style={{ color: "#080808" }}>
            JC
          </span>
        </div>
        <span className="font-semibold text-sm tracking-tight" style={{ color: "#f0ede8" }}>
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
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              color: "#f59e0b",
            }}
          >
            {activeCount} processing
          </span>
        )}

        {user && (
          <div className="flex items-center gap-3">
            <Link href="/profile" style={{ display: "flex", alignItems: "center" }}>
              <Avatar name={user.name} image={user.image} size={28} />
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/auth" })}
              className="text-xs transition-colors"
              style={{ color: "#6b6b6b" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f0ede8"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b6b6b"; }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
