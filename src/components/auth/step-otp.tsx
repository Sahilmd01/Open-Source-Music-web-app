"use client";

import { useRef, useState, useEffect } from "react";
import { CheckIcon } from "@/components/icons";

interface StepOtpProps {
  email: string;
  otp: string[];
  setOtp: (otp: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResendOtp: () => void;
  isLoading: boolean;
  error: string | null;
}

export function StepOtp({
  email,
  otp,
  setOtp,
  onSubmit,
  onResendOtp,
  isLoading,
  error,
}: StepOtpProps) {
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [showToast, setShowToast] = useState(true);

  // Auto-dismiss top notification after 4 seconds
  useEffect(() => {
    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [email]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      if (pasted.length > 0) {
        const next = [...otp];
        for (let i = 0; i < 6; i++) {
          next[i] = pasted[i] || "";
        }
        setOtp(next);
        const nextIndex = Math.min(pasted.length, 5);
        otpInputsRef.current[nextIndex]?.focus();
        return;
      }
    }

    const singleDigit = value.slice(-1).replace(/\D/g, "");
    const next = [...otp];
    next[index] = singleDigit;
    setOtp(next);

    if (singleDigit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <>
      {/* Floating Top Notification Popup (shown at the top of the screen, auto-disappears) */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 18px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-pill)",
            color: "var(--text-primary)",
            fontSize: "var(--fs-xs)",
            fontWeight: "var(--fw-medium)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(16px)",
            animation: "fadeScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--accent)",
              color: "var(--text-on-accent)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <CheckIcon width={13} height={13} />
          </div>
          <span>
            OTP code sent to <strong style={{ color: "var(--brand)" }}>{email}</strong>
          </span>
        </div>
      )}

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
          Enter OTP Code
        </h2>
        <p
          style={{
            fontSize: "var(--fs-xs)",
            color: "var(--text-muted)",
            marginTop: "4px",
            marginBottom: 0,
          }}
        >
          Type the 6-digit code sent to your email
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

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
        {/* 6 Digit Inputs */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "6px",
          }}
        >
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                otpInputsRef.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
              style={{
                width: 44,
                height: 48,
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "var(--fw-bold)",
                borderRadius: "var(--radius-md)",
                border: digit ? "1.5px solid var(--brand)" : "1px solid var(--border-default)",
                background: "var(--bg-surface-2)",
                color: "var(--text-primary)",
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
            />
          ))}
        </div>

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
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>

        <button
          type="button"
          onClick={() => {
            setShowToast(true);
            onResendOtp();
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          Didn&apos;t receive code? Resend OTP
        </button>
      </form>
    </>
  );
}
