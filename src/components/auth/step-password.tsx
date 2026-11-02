"use client";

interface StepPasswordProps {
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
}

export function StepPassword({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  isLoading,
  error,
}: StepPasswordProps) {
  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "var(--space-4)" }}>
        <h2
          id="forgot-modal-title"
          style={{
            fontSize: "var(--fs-xl)",
            fontWeight: "var(--fw-bold)",
            letterSpacing: "-0.01em",
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          Set New Password
        </h2>
        <p
          style={{
            fontSize: "var(--fs-xs)",
            color: "var(--text-muted)",
            marginTop: "4px",
            marginBottom: 0,
          }}
        >
          Create and confirm your new account password
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "8px 12px",
            background: "var(--error-soft)",
            border: "1px solid var(--error-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--error-text)",
            fontSize: "var(--fs-xs)",
            marginBottom: "var(--space-3)",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "var(--space-3)" }}>
        <div className="field" style={{ margin: 0, gap: "4px" }}>
          <label className="label" htmlFor="new-pass" style={{ fontSize: "var(--fs-xs)" }}>
            New Password
          </label>
          <input
            id="new-pass"
            type="password"
            className="input"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ minHeight: 38, padding: "0 var(--space-4)", fontSize: "var(--fs-sm)" }}
            autoFocus
            required
          />
        </div>

        <div className="field" style={{ margin: 0, gap: "4px" }}>
          <label className="label" htmlFor="confirm-pass" style={{ fontSize: "var(--fs-xs)" }}>
            Confirm New Password
          </label>
          <input
            id="confirm-pass"
            type="password"
            className="input"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ minHeight: 38, padding: "0 var(--space-4)", fontSize: "var(--fs-sm)" }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn--primary"
          style={{
            width: "100%",
            minHeight: 38,
            marginTop: "var(--space-2)",
            padding: "8px",
            fontWeight: "var(--fw-semibold)",
            fontSize: "var(--fs-sm)",
            borderRadius: "var(--radius-pill)",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Updating password..." : "Reset Password"}
        </button>
      </form>
    </>
  );
}
