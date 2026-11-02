"use client";

import { useState, useRef, useEffect } from "react";
import { CheckIcon, AlertIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/toast-provider";

interface SecurityTabProps {
  userEmail?: string;
}

export function SecurityTab({ userEmail = "alex.jordan@soundwave.io" }: SecurityTabProps) {
  const { toast } = useToast();

  // Reset Password Flow State:
  // "idle" -> "otp" -> "new_password" -> "success"
  const [resetStep, setResetStep] = useState<"idle" | "otp" | "new_password" | "success">("idle");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(30);

  // New password inputs
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2FA toggle
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP resend
  useEffect(() => {
    if (resetStep !== "otp" || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resetStep, resendCooldown]);

  // Trigger OTP Send
  const handleStartReset = () => {
    setResetStep("otp");
    setDigits(["", "", "", "", "", ""]);
    setOtpError("");
    setResendCooldown(30);
    toast({
      kind: "info",
      title: "OTP Sent",
      description: `We've sent a 6-digit password reset code to ${userEmail}.`,
    });
    setTimeout(() => inputsRef.current[0]?.focus(), 150);
  };

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal && val !== "") return;

    const nextDigits = [...digits];

    if (cleanVal.length > 1) {
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
    setOtpError("");

    if (cleanVal && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setResetStep("new_password");
      toast({
        kind: "success",
        title: "Code Verified",
        description: "Please enter your new password.",
      });
    }, 600);
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({
        kind: "error",
        title: "Weak password",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        kind: "error",
        title: "Passwords mismatch",
        description: "New password and confirmation do not match.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setResetStep("success");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        kind: "success",
        title: "Password Saved",
        description: "Your password has been successfully updated.",
      });
    }, 600);
  };

  return (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      {/* Password Reset Card */}
      <div
        style={{
          background: "var(--bg-surface-2)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          border: "1px solid var(--border-subtle)",
          display: "grid",
          gap: "var(--space-5)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-semibold)", margin: 0, color: "var(--text-primary)" }}>
            Password &amp; Security
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
            Reset your password with instant email OTP verification.
          </p>
        </div>

        {/* STEP 1: Idle - Click Reset Password */}
        {resetStep === "idle" && (
          <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
              Clicking reset will dispatch a secure 6-digit one-time code to <strong>{userEmail}</strong> to verify your identity before setting a new password.
            </p>
            <div>
              <Button type="button" variant="primary" onClick={handleStartReset}>
                Reset Password
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Fill OTP */}
        {resetStep === "otp" && (
          <form onSubmit={handleVerifyOtp} style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ background: "var(--bg-surface)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>
                Step 1: Enter 6-digit OTP
              </div>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", margin: "4px 0 0" }}>
                Sent to <strong>{userEmail}</strong>
              </p>

              {/* 6 Digit Input boxes */}
              <div style={{ display: "flex", gap: "8px", margin: "var(--space-4) 0 var(--space-2)" }}>
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
                      width: 44,
                      height: 52,
                      fontSize: "20px",
                      fontWeight: "var(--fw-bold)",
                      textAlign: "center",
                      borderRadius: "var(--radius-md)",
                      border: digit ? "1.5px solid var(--accent-500, #ff7c3b)" : "1px solid var(--border-subtle)",
                      background: "var(--bg-muted)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                ))}
              </div>

              {otpError && (
                <div style={{ color: "#ef4444", fontSize: "var(--fs-xs)", marginBottom: "var(--space-2)" }}>
                  {otpError}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
                <span>Didn&apos;t get code?</span>
                <button
                  type="button"
                  onClick={handleStartReset}
                  disabled={resendCooldown > 0}
                  style={{
                    background: "none",
                    border: "none",
                    color: resendCooldown > 0 ? "var(--text-muted)" : "var(--accent-500, #ff7c3b)",
                    cursor: resendCooldown > 0 ? "default" : "pointer",
                    textDecoration: resendCooldown > 0 ? "none" : "underline",
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <Button type="button" variant="ghost" size="sm" onClick={() => setResetStep("idle")}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={isSubmitting} disabled={digits.join("").length < 6}>
                Verify Code &amp; Continue
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: Add New Password & Save */}
        {resetStep === "new_password" && (
          <form onSubmit={handleSaveNewPassword} style={{ maxWidth: 480, display: "grid", gap: "var(--space-4)" }}>
            <div style={{ background: "rgba(34, 197, 94, 0.08)", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid rgba(34, 197, 94, 0.2)", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--fs-xs)", color: "#22c55e" }}>
              <CheckIcon width={14} height={14} />
              <span>OTP verified. Enter and save your new password below.</span>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="reset-new-pass">
                New Password
              </label>
              <input
                id="reset-new-pass"
                type="password"
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                autoFocus
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="reset-confirm-pass">
                Confirm New Password
              </label>
              <input
                id="reset-confirm-pass"
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>

            <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
              <Button type="button" variant="ghost" size="sm" onClick={() => setResetStep("idle")}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Save New Password
              </Button>
            </div>
          </form>
        )}

        {/* STEP 4: Success Message */}
        {resetStep === "success" && (
          <div
            style={{
              maxWidth: 480,
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-5)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#22c55e", fontWeight: "var(--fw-bold)" }}>
              <CheckIcon width={18} height={18} />
              <span>Password successfully updated!</span>
            </div>
            <p style={{ margin: 0, fontSize: "var(--fs-xs)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Your new password is now active. You can use it to log in on any device.
            </p>
            <div>
              <Button type="button" variant="secondary" size="sm" onClick={() => setResetStep("idle")}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Two-Factor Authentication Card */}
      <div
        style={{
          background: "var(--bg-surface-2)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ display: "grid", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-semibold)", margin: 0, color: "var(--text-primary)" }}>
              Two-Factor Authentication (2FA)
            </h3>
            {twoFactorEnabled && (
              <span className="badge badge--success" style={{ fontSize: "0.62rem" }}>
                Active
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
            Add an extra layer of security to your account with authenticator codes.
          </p>
        </div>

        <label className="switch">
          <input
            type="checkbox"
            checked={twoFactorEnabled}
            onChange={(e) => {
              setTwoFactorEnabled(e.target.checked);
              toast({
                kind: e.target.checked ? "success" : "info",
                title: e.target.checked ? "2FA Enabled" : "2FA Disabled",
                description: e.target.checked
                  ? "Two-factor verification will be required on your next login."
                  : "Two-factor verification has been deactivated.",
              });
            }}
          />
          <span className="switch__track" />
        </label>
      </div>
    </div>
  );
}
