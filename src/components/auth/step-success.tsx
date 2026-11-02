"use client";

import { CheckIcon } from "@/components/icons";

interface StepSuccessProps {
  onProceedToLogin: () => void;
}

export function StepSuccess({ onProceedToLogin }: StepSuccessProps) {
  return (
    <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "var(--accent)",
          color: "var(--text-on-accent)",
          display: "grid",
          placeItems: "center",
          margin: "0 auto var(--space-4)",
          boxShadow: "0 6px 16px rgba(251, 255, 122, 0.3)",
        }}
      >
        <CheckIcon width={24} height={24} />
      </div>

      <h2
        style={{
          fontSize: "var(--fs-xl)",
          fontWeight: "var(--fw-bold)",
          margin: 0,
          color: "var(--text-primary)",
        }}
      >
        Password Reset Success!
      </h2>
      <p
        style={{
          fontSize: "var(--fs-xs)",
          color: "var(--text-muted)",
          marginTop: "6px",
          marginBottom: "var(--space-5)",
        }}
      >
        Your password has been successfully updated. You can now log in with your new password.
      </p>

      <button
        type="button"
        className="btn btn--primary"
        onClick={onProceedToLogin}
        style={{
          width: "100%",
          minHeight: 38,
          borderRadius: "var(--radius-pill)",
          fontWeight: "var(--fw-semibold)",
          fontSize: "var(--fs-sm)",
        }}
      >
        Proceed to Log In
      </button>
    </div>
  );
}
