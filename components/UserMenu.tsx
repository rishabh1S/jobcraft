"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Sun, Moon, Monitor, LogOut, User } from "lucide-react";
import { Avatar } from "@/components/Avatar";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

type ThemeOption = "light" | "dark" | "system";

const THEME_OPTIONS: { value: ThemeOption; icon: React.ReactNode; label: string }[] = [
  { value: "light", icon: <Sun size={13} />, label: "Light" },
  { value: "system", icon: <Monitor size={13} />, label: "System" },
  { value: "dark", icon: <Moon size={13} />, label: "Dark" },
];

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          borderRadius: "50%",
          outline: open ? "2px solid color-mix(in srgb, var(--accent) 27%, transparent)" : "2px solid transparent",
          outlineOffset: 2,
          transition: "outline-color 0.15s",
        }}
        aria-label="User menu"
      >
        <Avatar name={user.name} image={user.image} size={28} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: 220,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            zIndex: 100,
          }}
        >
          {/* Name + email */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--foreground)",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.name ?? "User"}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--muted)",
                margin: "2px 0 0",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.email}
            </p>
          </div>

          {/* Profile link */}
          <div style={{ padding: "4px 6px", borderBottom: "1px solid var(--border)" }}>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px",
                borderRadius: 7,
                fontSize: 13,
                color: "var(--foreground)",
                textDecoration: "none",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--border)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              <User size={13} style={{ color: "var(--muted)" }} />
              Profile
            </Link>
          </div>

          {/* Theme switcher */}
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Theme</p>
            <div
              style={{
                display: "flex",
                gap: 4,
                background: "var(--border)",
                borderRadius: 8,
                padding: 3,
              }}
            >
              {THEME_OPTIONS.map(({ value, icon, label }) => {
                const active = theme === value;
                return (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    title={label}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      padding: "5px 0",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: active ? 600 : 400,
                      background: active ? "var(--surface)" : "transparent",
                      color: active ? "var(--accent)" : "var(--muted)",
                      boxShadow: active ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    {icon}
                    <span style={{ display: "none" }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sign out */}
          <div style={{ padding: "4px 6px" }}>
            <button
              onClick={() => signOut({ callbackUrl: "/auth" })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px",
                borderRadius: 7,
                fontSize: 13,
                color: "#ef4444",
                background: "none",
                border: "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--border)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
