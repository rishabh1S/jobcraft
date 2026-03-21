"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

type Tab = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const result = await signIn("credentials", {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });
    setLoginLoading(false);
    if (result?.error) {
      setLoginError("Invalid email or password.");
    } else {
      router.push("/");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || "Registration failed.");
        setRegLoading(false);
        return;
      }
      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email: regEmail,
        password: regPassword,
        redirect: false,
      });
      setRegLoading(false);
      if (result?.error) {
        setRegError("Registered but failed to sign in. Please log in.");
        setTab("login");
      } else {
        router.push("/");
      }
    } catch {
      setRegError("Something went wrong. Please try again.");
      setRegLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--surface-sunken)",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    color: "var(--foreground)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    color: "var(--muted)",
    marginBottom: 6,
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "transparent" }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <span className="font-semibold text-base tracking-tight" style={{ color: "var(--foreground)" }}>
            JobCraft
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 28,
          }}
        >
          {/* Tabs */}
          <div
            className="flex mb-6"
            style={{
              background: "var(--surface-sunken)",
              borderRadius: 10,
              padding: 4,
            }}
          >
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setLoginError("");
                  setRegError("");
                }}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: tab === t ? "var(--surface-elevated)" : "transparent",
                  color: tab === t ? "var(--foreground)" : "var(--muted)",
                  boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                }}
              >
                {t === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "color-mix(in srgb, var(--accent) 40%, transparent)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border-strong)"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ ...inputStyle, paddingRight: 36 }}
                    onFocus={(e) => { e.target.style.borderColor = "color-mix(in srgb, var(--accent) 40%, transparent)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border-strong)"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((s) => !s)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" }}
                  >
                    {showLoginPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p style={{ fontSize: 12, color: "var(--error)", margin: 0 }}>{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="flex items-center justify-center gap-2"
                style={{
                  padding: "10px 0",
                  borderRadius: 8,
                  background: "#1DB954",
                  color: "#000",
                  fontWeight: 600,
                  fontSize: 14,
                  border: "none",
                  cursor: loginLoading ? "not-allowed" : "pointer",
                  opacity: loginLoading ? 0.7 : 1,
                }}
              >
                {loginLoading && <Loader2 size={14} className="spinner" />}
                Sign in
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>or</span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>

              <OAuthButtons />
            </form>
          )}

          {/* Register form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Your name"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "color-mix(in srgb, var(--accent) 40%, transparent)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border-strong)"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "color-mix(in srgb, var(--accent) 40%, transparent)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border-strong)"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="8–12 chars, letter + digit"
                    required
                    style={{ ...inputStyle, paddingRight: 36 }}
                    onFocus={(e) => { e.target.style.borderColor = "color-mix(in srgb, var(--accent) 40%, transparent)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border-strong)"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword((s) => !s)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" }}
                  >
                    {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {regError && (
                <p style={{ fontSize: 12, color: "var(--error)", margin: 0 }}>{regError}</p>
              )}

              <button
                type="submit"
                disabled={regLoading}
                className="flex items-center justify-center gap-2"
                style={{
                  padding: "10px 0",
                  borderRadius: 8,
                  background: "#1DB954",
                  color: "#000",
                  fontWeight: 600,
                  fontSize: 14,
                  border: "none",
                  cursor: regLoading ? "not-allowed" : "pointer",
                  opacity: regLoading ? 0.7 : 1,
                }}
              >
                {regLoading && <Loader2 size={14} className="spinner" />}
                Create account
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>or</span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>

              <OAuthButtons />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function OAuthButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(provider);
    await signIn(provider, { callbackUrl: "/" });
  };

  const btnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "9px 0",
    borderRadius: 8,
    background: "var(--surface-sunken)",
    border: "1px solid var(--border-strong)",
    color: "var(--foreground)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={!!loading}
        style={{ ...btnStyle, opacity: loading === "google" ? 0.7 : 1 }}
      >
        {loading === "google" ? (
          <Loader2 size={14} className="spinner" />
        ) : (
          <GoogleIcon />
        )}
        Google
      </button>
      <button
        type="button"
        onClick={() => handleOAuth("github")}
        disabled={!!loading}
        style={{ ...btnStyle, opacity: loading === "github" ? 0.7 : 1 }}
      >
        {loading === "github" ? (
          <Loader2 size={14} className="spinner" />
        ) : (
          <GitHubIcon />
        )}
        GitHub
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}
