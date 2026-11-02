"use client";

import { CheckIcon, UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { ProfileData } from "./profile-types";
import { useGeneralInfoForm } from "./use-general-info";

interface GeneralInfoTabProps {
  profile: ProfileData;
  onUpdateProfile: (partial: Partial<ProfileData>) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function GeneralInfoTab({ profile, onUpdateProfile, onDirtyChange }: GeneralInfoTabProps) {
  const {
    name,
    setName,
    username,
    handleUsernameChange,
    bio,
    setBio,
    phone,
    setPhone,
    isSaving,
    isDirty,
    resetForm,
    usernameStatus,
    usernameFeedback,
    handleSubmit,
  } = useGeneralInfoForm({ profile, onUpdateProfile, onDirtyChange });

  const isSaveDisabled =
    !isDirty ||
    isSaving ||
    usernameStatus === "unavailable" ||
    usernameStatus === "checking" ||
    !name.trim() ||
    !username.trim();

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
      {/* 1. Header with Compact Title and Primary Save Changes Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          padding: "var(--space-2) 0",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "var(--fs-base)",
              fontWeight: "var(--fw-semibold)",
              margin: 0,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <UserIcon width={17} height={17} style={{ color: "var(--brand)" }} />
            General &amp; About
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Manage your personal identity, handle, contact, and bio.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={isSaving}
          disabled={isSaveDisabled}
          leadingIcon={<CheckIcon width={14} height={14} />}
          style={{ minWidth: 120, height: 36, fontWeight: "var(--fw-semibold)" }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* 2. Compressed Identity Card */}
      <div
        style={{
          background: "var(--bg-surface-2)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4) var(--space-5)",
          border: "1px solid var(--border-subtle)",
          display: "grid",
          gap: "var(--space-4)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Row 1: Name & Username */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {/* Display Name */}
          <div className="field" style={{ margin: 0 }}>
            <label
              className="field__label"
              htmlFor="profile-name"
              style={{ fontSize: "0.76rem", fontWeight: "var(--fw-medium)", marginBottom: 4 }}
            >
              Display Name <span style={{ color: "var(--brand)" }}>*</span>
            </label>
            <input
              id="profile-name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Jordan"
              required
              style={{ height: 38, fontSize: "var(--fs-sm)", padding: "0 12px" }}
            />
          </div>

          {/* Username */}
          <div className="field" style={{ margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <label
                className="field__label"
                htmlFor="profile-username"
                style={{ fontSize: "0.76rem", fontWeight: "var(--fw-medium)", margin: 0 }}
              >
                Username <span style={{ color: "var(--brand)" }}>*</span>
              </label>
              {usernameFeedback && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "var(--fw-semibold)",
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
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "11px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  fontWeight: "var(--fw-semibold)",
                  fontSize: "var(--fs-xs)",
                  pointerEvents: "none",
                }}
              >
                @
              </span>
              <input
                id="profile-username"
                type="text"
                className="input"
                style={{
                  height: 38,
                  fontSize: "var(--fs-sm)",
                  padding: "0 12px 0 28px",
                  borderColor:
                    usernameStatus === "available"
                      ? "rgba(34, 197, 94, 0.6)"
                      : usernameStatus === "unavailable"
                        ? "rgba(239, 68, 68, 0.7)"
                        : undefined,
                }}
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="username"
                required
              />
            </div>
          </div>
        </div>

        {/* Row 2: Phone & Email */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {/* Mobile Phone */}
          <div className="field" style={{ margin: 0 }}>
            <label
              className="field__label"
              htmlFor="profile-phone"
              style={{ fontSize: "0.76rem", fontWeight: "var(--fw-medium)", marginBottom: 4 }}
            >
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555-0199"
              style={{ height: 38, fontSize: "var(--fs-sm)", padding: "0 12px" }}
            />
          </div>

          {/* Email (Readonly) */}
          <div className="field" style={{ margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <label
                className="field__label"
                htmlFor="profile-email-ro"
                style={{ fontSize: "0.76rem", fontWeight: "var(--fw-medium)", margin: 0 }}
              >
                Account Email
              </label>
              <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Linked to account</span>
            </div>
            <input
              id="profile-email-ro"
              type="email"
              className="input"
              value={profile.email || ""}
              readOnly
              disabled
              style={{
                height: 38,
                fontSize: "var(--fs-sm)",
                padding: "0 12px",
                opacity: 0.75,
                background: "var(--bg-surface-3, rgba(255, 255, 255, 0.03))",
                cursor: "not-allowed",
              }}
            />
          </div>
        </div>

        {/* Row 3: Bio */}
        <div className="field" style={{ margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <label
              className="field__label"
              htmlFor="profile-bio"
              style={{ fontSize: "0.76rem", fontWeight: "var(--fw-medium)", margin: 0 }}
            >
              Bio / About Me
            </label>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              {bio.length} / 250
            </span>
          </div>
          <textarea
            id="profile-bio"
            className="input"
            rows={2}
            maxLength={250}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell listeners and artists about yourself, your taste, and favorite genres..."
            style={{
              resize: "vertical",
              minHeight: 64,
              padding: "8px 12px",
              lineHeight: 1.45,
              fontSize: "var(--fs-sm)",
            }}
          />
        </div>
      </div>
    </form>
  );
}
