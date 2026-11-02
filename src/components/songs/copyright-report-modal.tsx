"use client";

import { useState, useEffect } from "react";
import { CopyrightIcon, CloseIcon } from "@/components/icons";
import { useToast } from "@/providers/toast-provider";
import type { Track } from "@/types/music";

interface CopyrightReportModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
}

const REPORTING_ROLES = [
  "Copyright owner / artist",
  "Authorized representative",
  "Other interested party",
];

const WORK_TYPES = [
  "Sound recording (audio track)",
  "Musical composition or lyrics",
  "Both recording and composition",
  "Other copyrighted material",
];

export function CopyrightReportModal({ track, isOpen, onClose }: CopyrightReportModalProps) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [reportingAs, setReportingAs] = useState(REPORTING_ROLES[0]!);
  const [workType, setWorkType] = useState(WORK_TYPES[0]!);
  const [songLink, setSongLink] = useState("");
  const [explanation, setExplanation] = useState("");
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate song URL when opened
  useEffect(() => {
    if (track && isOpen && typeof window !== "undefined") {
      setSongLink(`${window.location.origin}/songs?id=${encodeURIComponent(track.id)}`);
    }
  }, [track, isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !track) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationChecked) {
      toast({
        kind: "error",
        title: "Declaration required",
        description: "Please check the good faith declaration box to proceed.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      toast({
        kind: "success",
        title: "Copyright Report Submitted",
        description: `Your formal notice for "${track.title}" has been registered. Our legal team will review it.`,
      });
      setFullName("");
      setEmail("");
      setExplanation("");
      setDeclarationChecked(false);
    }, 450);
  };

  return (
    <div
      className="report-modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Copyright infringement report"
        className="report-modal-dialog"
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="report-modal-handle" />

        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ color: "var(--brand)", marginTop: "2px" }}>
              <CopyrightIcon width={22} height={22} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: "var(--fw-bold)",
                  color: "var(--text-primary)",
                  lineHeight: 1.25,
                }}
              >
                Copyright infringement report
              </h2>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  lineHeight: 1.3,
                }}
              >
                Listenify · Rights protection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-xs)",
              transition: "color var(--dur-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* Introductory Description */}
        <p
          style={{
            margin: "0 0 20px",
            fontSize: "12.5px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          Use this form if you believe music on Listenify infringes copyright you own or are authorized to represent.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          {/* SECTION 1: Your Information */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "var(--fw-bold)",
                color: "var(--text-primary)",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "8px",
              }}
            >
              1. Your information
            </div>

            {/* Full Name */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "var(--fw-semibold)",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Full name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your legal name"
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "0 14px",
                  fontSize: "13px",
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-pill)",
                  color: "var(--text-primary)",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color var(--dur-fast)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>

            {/* Email Address */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "var(--fw-semibold)",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "0 14px",
                  fontSize: "13px",
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-pill)",
                  color: "var(--text-primary)",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color var(--dur-fast)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>

            {/* I am reporting as */}
            <div style={{ marginTop: "4px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "var(--fw-semibold)",
                  color: "var(--text-secondary)",
                  marginBottom: "8px",
                }}
              >
                I am reporting as
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {REPORTING_ROLES.map((role) => {
                  const isSelected = reportingAs === role;
                  return (
                    <label
                      key={role}
                      onClick={() => setReportingAs(role)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        userSelect: "none",
                        padding: "4px 6px",
                        borderRadius: "var(--radius-xs)",
                        background: isSelected ? "var(--brand-soft)" : "transparent",
                        transition: "background var(--dur-fast)",
                      }}
                    >
                      <div
                        style={{
                          width: 17,
                          height: 17,
                          borderRadius: "50%",
                          border: isSelected
                            ? "5px solid var(--brand)"
                            : "1.5px solid var(--border-default)",
                          background: isSelected ? "var(--bg-surface)" : "transparent",
                          boxSizing: "border-box",
                          flexShrink: 0,
                          transition: "border var(--dur-fast)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: isSelected ? "var(--fw-semibold)" : "var(--fw-regular)",
                          color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                        }}
                      >
                        {role}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: Identify the copyrighted work */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "var(--fw-bold)",
                color: "var(--text-primary)",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "8px",
              }}
            >
              2. Identify the copyrighted work
            </div>

            {/* Type of work */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "var(--fw-semibold)",
                  color: "var(--text-secondary)",
                  marginBottom: "8px",
                }}
              >
                Type of work
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {WORK_TYPES.map((type) => {
                  const isSelected = workType === type;
                  return (
                    <label
                      key={type}
                      onClick={() => setWorkType(type)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        userSelect: "none",
                        padding: "4px 6px",
                        borderRadius: "var(--radius-xs)",
                        background: isSelected ? "var(--brand-soft)" : "transparent",
                        transition: "background var(--dur-fast)",
                      }}
                    >
                      <div
                        style={{
                          width: 17,
                          height: 17,
                          borderRadius: "50%",
                          border: isSelected
                            ? "5px solid var(--brand)"
                            : "1.5px solid var(--border-default)",
                          background: isSelected ? "var(--bg-surface)" : "transparent",
                          boxSizing: "border-box",
                          flexShrink: 0,
                          transition: "border var(--dur-fast)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: isSelected ? "var(--fw-semibold)" : "var(--fw-regular)",
                          color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                        }}
                      >
                        {type}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Link to the song on Listenify */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "var(--fw-semibold)",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Link to the song on Listenify
              </label>
              <input
                type="text"
                required
                value={songLink}
                onChange={(e) => setSongLink(e.target.value)}
                placeholder="Paste the reported song URL"
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "0 14px",
                  fontSize: "13px",
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-pill)",
                  color: "var(--text-primary)",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color var(--dur-fast)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>

            {/* Explain your rights and the issue */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "var(--fw-semibold)",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Explain your rights and the issue
              </label>
              <textarea
                required
                rows={3}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Song title, original release link, your relationship to the work, and why you believe this upload is unauthorized..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: "13px",
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                  lineHeight: 1.45,
                  transition: "border-color var(--dur-fast)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>
          </div>

          {/* SECTION 3: Declaration */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "var(--fw-bold)",
                color: "var(--text-primary)",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "8px",
              }}
            >
              3. Declaration
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                required
                checked={declarationChecked}
                onChange={(e) => setDeclarationChecked(e.target.checked)}
                style={{
                  accentColor: "var(--brand)",
                  width: 17,
                  height: 17,
                  marginTop: 2,
                  cursor: "pointer",
                }}
              />
              <span
                style={{
                  fontSize: "12.5px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.45,
                }}
              >
                I believe in good faith that the use described in this report is not authorized by the rights holder, their agent, or applicable law. The information I have provided is accurate to the best of my knowledge, and I am the rights holder or authorized to act on their behalf.
              </span>
            </label>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: "11px",
                color: "var(--text-muted)",
                lineHeight: 1.4,
              }}
            >
              Please provide truthful information. Additional evidence or authorization documents may be requested during review.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              height: 42,
              borderRadius: "var(--radius-pill)",
              background: declarationChecked ? "var(--brand)" : "var(--bg-surface-3)",
              color: declarationChecked ? "var(--text-on-brand)" : "var(--text-muted)",
              fontSize: "13.5px",
              fontWeight: "var(--fw-semibold)",
              border: "none",
              cursor: isSubmitting || !declarationChecked ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background var(--dur-fast), color var(--dur-fast)",
              boxShadow: declarationChecked ? "var(--shadow-sm)" : "none",
            }}
            onMouseEnter={(e) => {
              if (declarationChecked && !isSubmitting) {
                e.currentTarget.style.background = "var(--brand-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (declarationChecked && !isSubmitting) {
                e.currentTarget.style.background = "var(--brand)";
              }
            }}
          >
            <span>{isSubmitting ? "Submitting copyright report..." : "Submit copyright report →"}</span>
          </button>

          {/* Footer note */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "-10px",
            }}
          >
            UI preview only. No data is sent or stored.
          </div>
        </form>
      </div>
    </div>
  );
}
