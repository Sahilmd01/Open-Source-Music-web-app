"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, CloseIcon } from "@/components/icons";

interface VerifyAccountModalProps {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
  onVerified: () => void;
}

export function VerifyAccountModal({
  isOpen,
  userEmail,
  onClose,
  onVerified,
}: VerifyAccountModalProps) {
  // Step 1: "otp" (enter 6 digit OTP)
  // Step 2: "success" (congratulations message with feature unlock list)
  const [step, setStep] = useState<"otp" | "success">("otp");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on open & cooldown timer
  useEffect(() => {
    if (isOpen) {
      setStep("otp");
      setDigits(["", "", "", "", "", ""]);
      setErrorMessage("");
      setResendCooldown(30);
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || resendCooldown <= 0 || step === "success") return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, resendCooldown, step]);

  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal && val !== "") return;

    const nextDigits = [...digits];

    if (cleanVal.length > 1) {
      // Handle paste
      const pasted = cleanVal.slice(0, 6).split("");
      pasted.forEach((d, i) => {
        if (i < 6) nextDigits[i] = d;
      });
      setDigits(nextDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputsRef.current[nextFocus]?.focus();
      return;
    }

    nextDigits[index] = cleanVal;
    setDigits(nextDigits);
    setErrorMessage("");

    if (cleanVal && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      setErrorMessage("Please enter all 6 digits.");
      return;
    }

    setIsVerifying(true);
    // Simulate verification check
    setTimeout(() => {
      setIsVerifying(false);
      setStep("success");
      onVerified();
    }, 800);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setDigits(["", "", "", "", "", ""]);
    setErrorMessage("");
    setResendCooldown(30);
    inputsRef.current[0]?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        zIndex: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-4)",
      }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Account Verification"
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5)",
          position: "relative",
          animation: "modalFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          padding: "var(--space-6)",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--bg-muted)",
            color: "var(--text-muted)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <CloseIcon width={16} height={16} />
        </button>

        {step === "otp" ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "rgba(255, 124, 59, 0.12)",
                  color: "var(--accent-500, #ff7c3b)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-3)",
                }}
              >
                <CheckIcon width={24} height={24} />
              </div>
              <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)" }}>
                Verify Your Account
              </h2>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "var(--fs-sm)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                OTP sent! Please check your email: <br />
                <strong style={{ color: "var(--text-primary)" }}>{userEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleVerify}>
              {/* 6 Digit Inputs */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  margin: "var(--space-5) 0",
                }}
              >
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    style={{
                      width: 48,
                      height: 56,
                      fontSize: "22px",
                      fontWeight: "var(--fw-bold)",
                      textAlign: "center",
                      borderRadius: "var(--radius-lg)",
                      border: digit
                        ? "1.5px solid var(--accent-500, #ff7c3b)"
                        : "1px solid var(--border-subtle)",
                      background: "var(--bg-muted)",
                      color: "var(--text-primary)",
                      outline: "none",
                      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                    }}
                  />
                ))}
              </div>

              {errorMessage && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "var(--fs-xs)",
                    textAlign: "center",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                style={{ width: "100%", padding: "12px", fontSize: "var(--fs-sm)" }}
                disabled={isVerifying || digits.join("").length < 6}
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </Button>

              <div
                style={{
                  textAlign: "center",
                  marginTop: "var(--space-4)",
                  fontSize: "var(--fs-xs)",
                  color: "var(--text-muted)",
                }}
              >
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  style={{
                    background: "none",
                    border: "none",
                    color: resendCooldown > 0 ? "var(--text-muted)" : "var(--accent-500, #ff7c3b)",
                    fontWeight: "var(--fw-medium)",
                    cursor: resendCooldown > 0 ? "default" : "pointer",
                    textDecoration: resendCooldown > 0 ? "none" : "underline",
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Step 2: Congratulations View */
          <div style={{ textAlign: "center", padding: "var(--space-3) 0" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(34, 197, 94, 0.15)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "var(--space-4)",
                boxShadow: "0 0 24px rgba(34, 197, 94, 0.25)",
                overflow: "hidden",
              }}
            >
              <img
                src="/verification.gif"
                alt="Account Verified"
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "var(--fs-2xl)",
                fontWeight: "var(--fw-bold)",
                color: "var(--text-primary)",
              }}
            >
              Congratulations!
            </h2>
            <p
              style={{
                margin: "8px 0 var(--space-5)",
                fontSize: "var(--fs-base)",
                color: "#22c55e",
                fontWeight: "var(--fw-medium)",
              }}
            >
              Your account has been officially verified!
            </p>

            {/* Unlocked Capabilities Box */}
            <div
              style={{
                background: "var(--bg-muted)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
                textAlign: "left",
                marginBottom: "var(--space-6)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--fs-xs)",
                  textTransform: "uppercase",
                  fontWeight: "var(--fw-bold)",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Features Now Unlocked:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "var(--fs-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)" }}>
                  <span style={{ color: "#22c55e", display: "flex" }}>
                    <CheckIcon width={16} height={16} />
                  </span>
                  <span><strong>Upload Music:</strong> Share your original tracks and albums with listeners</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)" }}>
                  <span style={{ color: "#22c55e", display: "flex" }}>
                    <CheckIcon width={16} height={16} />
                  </span>
                  <span><strong>Create Public Playlists:</strong> Curate and publish featured playlists</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)" }}>
                  <span style={{ color: "#22c55e", display: "flex" }}>
                    <CheckIcon width={16} height={16} />
                  </span>
                  <span><strong>Verified Badge:</strong> Display verified badge across profile and comments</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              style={{ width: "100%", padding: "12px", fontSize: "var(--fs-sm)" }}
              onClick={onClose}
            >
              Done &amp; Explore
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
