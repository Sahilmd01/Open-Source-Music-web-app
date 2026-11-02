"use client";

import { useState, useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";
import { CloseIcon } from "@/components/icons";
import { useToast } from "@/providers/toast-provider";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export function SignupModal({ open, onClose, onSwitchToLogin }: SignupModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time username check state
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [usernameFeedback, setUsernameFeedback] = useState<string>("");

  const loginUser = useUiStore((s) => s.login);
  const { toast } = useToast();

  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) {
      setUsernameStatus("idle");
      setUsernameFeedback("");
      return;
    }

    if (clean.length < 3) {
      setUsernameStatus("unavailable");
      setUsernameFeedback("Must be at least 3 characters");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      setUsernameStatus("unavailable");
      setUsernameFeedback("Letters, numbers, underscores only");
      return;
    }

    setUsernameStatus("checking");
    setUsernameFeedback("Checking...");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus("available");
          setUsernameFeedback("Username available");
        } else {
          setUsernameStatus("unavailable");
          setUsernameFeedback(data.error || "Username is taken");
        }
      } catch {
        setUsernameStatus("idle");
        setUsernameFeedback("");
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim() || undefined,
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        setIsLoading(false);
        return;
      }

      loginUser(data.user);
      setIsLoading(false);
      toast({
        kind: "success",
        title: "Account Created!",
        description: `Welcome to Listenify, ${data.user.name}!`,
      });
      onClose();
    } catch (err: any) {
      console.error("Signup error:", err);
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
        aria-labelledby="signup-modal-title"
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

        {/* Modal Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-3)" }}>
          <h2
            id="signup-modal-title"
            style={{
              fontSize: "var(--fs-xl)",
              fontWeight: "var(--fw-bold)",
              letterSpacing: "-0.01em",
              margin: 0,
              color: "var(--text-primary)",
            }}
          >
            Sign Up
          </h2>
          <p
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--text-muted)",
              marginTop: "4px",
              marginBottom: 0,
            }}
          >
            Start curating your sound collections
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

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-3)" }}>
          <div className="field" style={{ margin: 0, gap: "4px" }}>
            <label className="label" htmlFor="signup-name" style={{ fontSize: "var(--fs-xs)" }}>
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              className="input"
              placeholder="Alex Jordan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ minHeight: 38, padding: "0 var(--space-4)", fontSize: "var(--fs-sm)" }}
              autoFocus
              required
            />
          </div>

          <div className="field" style={{ margin: 0, gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label className="label" htmlFor="signup-username" style={{ fontSize: "var(--fs-xs)" }}>
                Username <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>(optional)</span>
              </label>
              {usernameFeedback && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "var(--fw-medium)",
                    color:
                      usernameStatus === "available"
                        ? "#22c55e"
                        : usernameStatus === "unavailable"
                        ? "#ef4444"
                        : "var(--text-muted)",
                  }}
                >
                  {usernameFeedback}
                </span>
              )}
            </div>
            <input
              id="signup-username"
              type="text"
              className="input"
              placeholder="alexjordan"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              style={{
                minHeight: 38,
                padding: "0 var(--space-4)",
                fontSize: "var(--fs-sm)",
                borderColor:
                  usernameStatus === "available"
                    ? "rgba(34, 197, 94, 0.6)"
                    : usernameStatus === "unavailable"
                    ? "rgba(239, 68, 68, 0.7)"
                    : undefined,
              }}
            />
          </div>

          <div className="field" style={{ margin: 0, gap: "4px" }}>
            <label className="label" htmlFor="signup-email" style={{ fontSize: "var(--fs-xs)" }}>
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              className="input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ minHeight: 38, padding: "0 var(--space-4)", fontSize: "var(--fs-sm)" }}
              required
            />
          </div>

          <div className="field" style={{ margin: 0, gap: "4px" }}>
            <label className="label" htmlFor="signup-password" style={{ fontSize: "var(--fs-xs)" }}>
              Password
            </label>
            <input
              id="signup-password"
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
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              I agree to the Terms & Privacy
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
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Switch to Log in link */}
        {onSwitchToLogin && (
          <div style={{ marginTop: "var(--space-4)", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
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
          </div>
        )}
      </div>
    </div>
  );
}
