"use client";

import { useState, useEffect } from "react";
import { FlagIcon, CloseIcon, CopyrightIcon } from "@/components/icons";
import { useToast } from "@/providers/toast-provider";
import type { Track } from "@/types/music";

interface ReportSongModalProps {
  track: Track | null;
  isOpen: boolean;
  initialReason?: string;
  onClose: () => void;
  onSwitchToCopyright?: () => void;
}

const REPORT_REASONS = [
  "Spam or misleading content",
  "Hateful or abusive content",
  "Inappropriate or explicit content",
  "Impersonation or fake artist",
  "Other issue",
];

export function ReportSongModal({
  track,
  isOpen,
  initialReason,
  onClose,
  onSwitchToCopyright,
}: ReportSongModalProps) {
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]!);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialReason && REPORT_REASONS.includes(initialReason)) {
      setSelectedReason(initialReason);
    } else {
      setSelectedReason(REPORT_REASONS[0]!);
    }
  }, [initialReason, isOpen]);

  // Handle escape key
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
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      toast({
        kind: "success",
        title: "Report Submitted",
        description: `Thank you for reporting "${track.title}". Our moderation team will review this track promptly.`,
      });
      setDescription("");
      setSelectedReason(REPORT_REASONS[0]!);
    }, 400);
  };

  return (
    <div
      className="report-modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Report Song: ${track.title}`}
        className="report-modal-dialog"
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="report-modal-handle" />

        {/* Header with Flag, Title, Subtitle, and Close button */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "var(--space-5)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ color: "var(--brand)", marginTop: "2px" }}>
              <FlagIcon width={20} height={20} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "var(--fs-md)",
                  fontWeight: "var(--fw-bold)",
                  color: "var(--text-primary)",
                  lineHeight: 1.25,
                }}
              >
                Report song
              </h2>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "var(--fs-xs)",
                  color: "var(--text-muted)",
                  lineHeight: 1.3,
                }}
              >
                Your report helps keep Listenify safe.
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

        {/* Target Song Info Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "var(--space-6)",
            padding: "var(--space-2) var(--space-3)",
            background: "var(--bg-surface-2)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
              flexShrink: 0,
              background: "var(--bg-surface-3)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {track.coverImage ? (
              <img
                src={track.coverImage}
                alt={track.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "var(--hero-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "14px",
                }}
              >
                ♪
              </div>
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: "var(--fs-base)",
                fontWeight: "var(--fw-semibold)",
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.25,
              }}
            >
              {track.title}
            </div>
            <div
              style={{
                fontSize: "var(--fs-xs)",
                color: "var(--text-secondary)",
                marginTop: "3px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {track.artist}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              Listenify · Song report
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          {/* Reason Section Title */}
          <div
            style={{
              fontSize: "var(--fs-sm)",
              fontWeight: "var(--fw-bold)",
              color: "var(--text-primary)",
              marginBottom: "var(--space-3)",
            }}
          >
            Why are you reporting this song?
          </div>

          {/* Radio Options List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "var(--space-5)",
            }}
          >
            {REPORT_REASONS.map((r) => {
              const isSelected = selectedReason === r;
              return (
                <label
                  key={r}
                  onClick={() => setSelectedReason(r)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    userSelect: "none",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-sm)",
                    background: isSelected ? "var(--brand-soft)" : "transparent",
                    transition: "background var(--dur-fast)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "var(--bg-surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Custom Radio Button */}
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: isSelected
                        ? "5px solid var(--brand)"
                        : "1.5px solid var(--border-default)",
                      background: isSelected ? "var(--bg-surface)" : "transparent",
                      boxSizing: "border-box",
                      transition: "border var(--dur-fast)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "var(--fs-sm)",
                      fontWeight: isSelected ? "var(--fw-semibold)" : "var(--fw-regular)",
                      color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                  >
                    {r}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Additional details */}
          <div style={{ marginBottom: "var(--space-5)" }}>
            <label
              style={{
                display: "block",
                fontSize: "var(--fs-xs)",
                fontWeight: "var(--fw-semibold)",
                color: "var(--text-secondary)",
                marginBottom: "var(--space-2)",
              }}
            >
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us a little more about the issue..."
              rows={3}
              style={{
                width: "100%",
                fontSize: "var(--fs-xs)",
                padding: "10px 14px",
                background: "var(--bg-surface-2)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                lineHeight: 1.45,
                transition: "border-color var(--dur-fast)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
          </div>

          {/* Copyright Notice Box */}
          <div
            onClick={() => {
              if (onSwitchToCopyright) onSwitchToCopyright();
            }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              marginBottom: "var(--space-5)",
              padding: "var(--space-3)",
              background: "var(--accent-soft)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              cursor: onSwitchToCopyright ? "pointer" : "default",
              transition: "transform var(--dur-fast), border-color var(--dur-fast)",
            }}
            title={onSwitchToCopyright ? "Click to open formal copyright infringement report" : undefined}
          >
            <div style={{ color: "var(--brand)", marginTop: "2px", flexShrink: 0 }}>
              <CopyrightIcon width={16} height={16} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "var(--fs-xs)",
                  fontWeight: "var(--fw-bold)",
                  color: "var(--text-primary)",
                  lineHeight: 1.25,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Copyright issue?</span>
                {onSwitchToCopyright && (
                  <span style={{ fontSize: "11px", color: "var(--brand)", fontWeight: "var(--fw-medium)" }}>
                    Open form →
                  </span>
                )}
              </div>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                If you own this music or believe it was uploaded without permission, use the separate copyright reporting option in the song menu.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              height: 42,
              borderRadius: "var(--radius-pill)",
              background: "var(--brand)",
              color: "var(--text-on-brand)",
              fontSize: "var(--fs-sm)",
              fontWeight: "var(--fw-semibold)",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background var(--dur-fast), transform var(--dur-fast)",
              boxShadow: "var(--shadow-sm)",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.background = "var(--brand-hover)";
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) e.currentTarget.style.background = "var(--brand)";
            }}
          >
            <FlagIcon width={14} height={14} />
            {isSubmitting ? "Submitting report..." : "Submit report"}
          </button>

          {/* Footer note */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "var(--space-3)",
            }}
          >
            Reports are reviewed by the Listenify moderation team.
          </div>
        </form>
      </div>
    </div>
  );
}
