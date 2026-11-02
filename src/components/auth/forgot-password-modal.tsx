"use client";

import { useState, useEffect } from "react";
import { CloseIcon } from "@/components/icons";
import { StepEmail } from "./step-email";
import { StepOtp } from "./step-otp";
import { StepPassword } from "./step-password";
import { StepSuccess } from "./step-success";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onBackToLogin?: () => void;
}

type ResetStep = "email" | "otp" | "password" | "success";

export function ForgotPasswordModal({
  open,
  onClose,
  onBackToLogin,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setStep("email");
      setEmail("");
      setOtp(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setIsLoading(false);
    }
  }, [open]);

  if (!open) return null;

  // Step 1: Submit Email
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
    }, 450);
  };

  // Step 2: Submit OTP
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("password");
    }, 450);
  };

  // Step 3: Submit New Password
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 500);
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
        aria-labelledby="forgot-modal-title"
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

        {/* Modular Steps */}
        {step === "email" && (
          <StepEmail
            email={email}
            setEmail={setEmail}
            onSubmit={handleEmailSubmit}
            isLoading={isLoading}
            error={error}
          />
        )}

        {step === "otp" && (
          <StepOtp
            email={email}
            otp={otp}
            setOtp={setOtp}
            onSubmit={handleOtpSubmit}
            onResendOtp={() => {
              setError(null);
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
              }, 300);
            }}
            isLoading={isLoading}
            error={error}
          />
        )}

        {step === "password" && (
          <StepPassword
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            onSubmit={handlePasswordSubmit}
            isLoading={isLoading}
            error={error}
          />
        )}

        {step === "success" && (
          <StepSuccess
            onProceedToLogin={() => {
              onClose();
              onBackToLogin?.();
            }}
          />
        )}

        {/* Back to login option */}
        {step !== "success" && onBackToLogin && (
          <div
            style={{
              marginTop: "var(--space-4)",
              textAlign: "center",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => {
                onClose();
                onBackToLogin();
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
              Back to log in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
