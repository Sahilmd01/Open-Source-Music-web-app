"use client";

import { useState } from "react";
import { useUiStore } from "@/stores/ui-store";
import { CloseIcon } from "@/components/icons";
import { useToast } from "@/providers/toast-provider";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignup?: () => void;
  onForgotPassword?: () => void;
}

export function LoginModal({
  open,
  onClose,
  onSwitchToSignup,
  onForgotPassword,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUser = useUiStore((s) => s.login);
  const { toast } = useToast();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to log in.");
        setIsLoading(false);
        return;
      }

      loginUser(data.user);
      setIsLoading(false);
      toast({
        kind: "success",
        title: "Welcome back!",
        description: `Logged in as ${data.user.name}`,
      });
      onClose();
    } catch (err: any) {
      console.error("Login request error:", err);
      setError("Network or server error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="auth-modal-glass"
      >
        {/* Close Button */}
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 28,
            height: 28,
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
          <CloseIcon width={14} height={14} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-4)" }}>
          <h2
            id="login-modal-title"
            style={{
              fontSize: "var(--fs-xl)",
              fontWeight: "var(--fw-bold)",
              letterSpacing: "-0.01em",
              margin: 0,
              color: "var(--text-primary)",
            }}
          >
            Log In
          </h2>
          <p
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--text-muted)",
              marginTop: "4px",
              marginBottom: 0,
            }}
          >
            Sign in to access your playlists & library
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: "8px 12px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-sm)",
              color: "#f87171",
              fontSize: "var(--fs-xs)",
              marginBottom: "var(--space-3)",
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-3)" }}>
          <div className="field" style={{ margin: 0, gap: "4px" }}>
            <label className="label" htmlFor="login-email" style={{ fontSize: "var(--fs-xs)" }}>
              Email or Username
            </label>
            <input
              id="login-email"
              type="text"
              className="input"
              placeholder="alex@example.com or alexjordan"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ minHeight: 38, padding: "0 var(--space-4)", fontSize: "var(--fs-sm)" }}
              autoFocus
              required
            />
          </div>

          <div className="field" style={{ margin: 0, gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label className="label" htmlFor="login-password" style={{ fontSize: "var(--fs-xs)" }}>
                Password
              </label>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "var(--brand)",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  onForgotPassword?.();
                }}
              >
                Forgot?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ minHeight: 38, padding: "0 var(--space-4)", fontSize: "var(--fs-sm)" }}
              required
            />
          </div>

          <label className="check" style={{ marginTop: "2px" }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              Remember me
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn--primary"
            style={{
              width: "100%",
              minHeight: 38,
              padding: "8px",
              fontWeight: "var(--fw-semibold)",
              fontSize: "var(--fs-sm)",
              borderRadius: "var(--radius-pill)",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Signing in..." : "Log In"}
          </button>
        </form>

        {/* Switch to Sign up link */}
        {onSwitchToSignup && (
          <div style={{ marginTop: "var(--space-4)", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "var(--brand)",
                fontWeight: "var(--fw-bold)",
                cursor: "pointer",
              }}
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
