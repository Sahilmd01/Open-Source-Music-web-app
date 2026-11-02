"use client";

import { useState } from "react";

interface StepEmailProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
}

export function StepEmail({
  email,
  setEmail,
  onSubmit,
  isLoading,
  error,
}: StepEmailProps) {
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
          Reset Password
        </h2>
        <p
          style={{
            fontSize: "var(--fs-xs)",
            color: "var(--text-muted)",
            marginTop: "4px",
            marginBottom: 0,
          }}
        >
          Enter your account email to receive a 6-digit OTP code
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
          <label className="label" htmlFor="reset-email" style={{ fontSize: "var(--fs-xs)" }}>
            Email Address
          </label>
          <input
            id="reset-email"
            type="email"
            className="input"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ minHeight: 38, padding: "0 var(--space-4)", fontSize: "var(--fs-sm)" }}
            autoFocus
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
          {isLoading ? "Sending OTP..." : "Send Verification Code"}
        </button>
      </form>
    </>
  );
}
