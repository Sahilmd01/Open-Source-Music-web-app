"use client";

import { useState, useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";
import { CloseIcon, CheckIcon } from "@/components/icons";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}

export function AuthModal({ open, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setError(null);
    }
  }, [open, defaultMode]);

  const loginUser = useUiStore((s) => s.login);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload = mode === "signup"
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed. Please check your details.");
        setIsLoading(false);
        return;
      }

      loginUser(data.user);
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      console.error("Auth modal error:", err);
      setError("Network or server connection failed.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        padding: "var(--space-4)",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl, 20px)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
          padding: "var(--space-8)",
          position: "relative",
          animation: "fadeScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--bg-surface-2)",
            border: "none",
            color: "var(--text-muted)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            transition: "all var(--dur-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.background = "var(--bg-surface-3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.background = "var(--bg-surface-2)";
          }}
        >
          <CloseIcon width={16} height={16} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "var(--accent-soft)",
              color: "var(--brand)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto var(--space-4)",
              fontWeight: "var(--fw-bold)",
              fontSize: "1.4rem",
            }}
          >
            ♫
          </div>
          <h2
            id="auth-modal-title"
            style={{
              fontSize: "var(--fs-2xl)",
              fontWeight: "var(--fw-bold)",
              letterSpacing: "-0.02em",
              margin: 0,
              color: "var(--text-primary)",
            }}
          >
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h2>
          <p
            style={{
              fontSize: "var(--fs-sm)",
              color: "var(--text-muted)",
              marginTop: "6px",
              marginBottom: 0,
            }}
          >
            {mode === "login"
              ? "Sign in to access your library, playlists & favorites."
              : "Join millions discovering music and creating collections."}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            padding: "4px",
            background: "var(--bg-surface-2)",
            borderRadius: "var(--radius-pill)",
            marginBottom: "var(--space-6)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            style={{
              padding: "8px 0",
              borderRadius: "var(--radius-pill)",
              border: "none",
              fontSize: "var(--fs-sm)",
              fontWeight: mode === "login" ? "var(--fw-bold)" : "var(--fw-medium)",
              background: mode === "login" ? "var(--bg-surface)" : "transparent",
              color: mode === "login" ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: mode === "login" ? "0 2px 8px rgba(0, 0, 0, 0.12)" : "none",
              cursor: "pointer",
              transition: "all var(--dur-fast)",
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            style={{
              padding: "8px 0",
              borderRadius: "var(--radius-pill)",
              border: "none",
              fontSize: "var(--fs-sm)",
              fontWeight: mode === "signup" ? "var(--fw-bold)" : "var(--fw-medium)",
              background: mode === "signup" ? "var(--bg-surface)" : "transparent",
              color: mode === "signup" ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: mode === "signup" ? "0 2px 8px rgba(0, 0, 0, 0.12)" : "none",
              cursor: "pointer",
              transition: "all var(--dur-fast)",
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid var(--error, #ef4444)",
              borderRadius: "var(--radius-md)",
              color: "var(--error, #ef4444)",
              fontSize: "var(--fs-xs)",
              marginBottom: "var(--space-4)",
            }}
          >
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
          {mode === "signup" && (
            <div className="field" style={{ margin: 0 }}>
              <label className="label" htmlFor="auth-name">
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                className="input"
                placeholder="Alex Jordan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus={mode === "signup"}
                required
              />
            </div>
          )}

          <div className="field" style={{ margin: 0 }}>
            <label className="label" htmlFor="auth-email">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              className="input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus={mode === "login"}
              required
            />
          </div>

          <div className="field" style={{ margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label className="label" htmlFor="auth-password">
                Password
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--brand)",
                    fontSize: "var(--fs-xs)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => {}}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              id="auth-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Remember me / terms checkbox */}
          <label className="check" style={{ marginTop: "4px" }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
              {mode === "login"
                ? "Remember me on this browser"
                : "I agree to the Terms of Service & Privacy Policy"}
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn--primary"
            style={{
              width: "100%",
              marginTop: "var(--space-2)",
              padding: "12px",
              fontWeight: "var(--fw-bold)",
              display: "grid",
              placeItems: "center",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* Footer Toggle text */}
        <div style={{ marginTop: "var(--space-6)", textAlign: "center", fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "var(--brand)",
                  fontWeight: "var(--fw-bold)",
                  cursor: "pointer",
                }}
              >
                Sign up for free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "var(--brand)",
                  fontWeight: "var(--fw-bold)",
                  cursor: "pointer",
                }}
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
