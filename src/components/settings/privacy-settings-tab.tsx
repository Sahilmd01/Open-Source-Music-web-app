"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/toast-provider";
import { SETTINGS_STORAGE_KEY, type UserPreferences } from "./settings-types";

interface PrivacySettingsTabProps {
  prefs: UserPreferences;
  onUpdatePref: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
}

export function PrivacySettingsTab({ prefs, onUpdatePref }: PrivacySettingsTabProps) {
  const { toast } = useToast();

  const handlePurgeCache = () => {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {
      // ignore
    }
    toast({
      kind: "warning",
      title: "Cache Cleared",
      description: "Local playback cache and search records have been purged.",
    });
  };

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
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
            Privacy & Data Controls
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
            Control your social activity broadcast and private listening sessions.
          </p>
        </div>

        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-surface-3)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div>
              <strong style={{ fontSize: "var(--fs-sm)", color: "var(--text-primary)" }}>
                Private Listening Session
              </strong>
              <p style={{ margin: "2px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
                Temporarily pause tracking your plays for personal recommendations and friend feeds.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={prefs.privateSession}
                onChange={(e) => onUpdatePref("privateSession", e.target.checked)}
              />
              <span className="switch__track" />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-surface-3)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div>
              <strong style={{ fontSize: "var(--fs-sm)", color: "var(--text-primary)" }}>
                Publish Activity to Followers
              </strong>
              <p style={{ margin: "2px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
                Show your current now-playing status on friend activity feeds.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={prefs.publishActivity}
                onChange={(e) => onUpdatePref("publishActivity", e.target.checked)}
              />
              <span className="switch__track" />
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div
          style={{
            marginTop: "var(--space-4)",
            padding: "var(--space-5)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--error-border)",
            background: "var(--error-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-3)",
          }}
        >
          <div>
            <strong style={{ color: "var(--error-text)", fontSize: "var(--fs-sm)" }}>
              Clear Local Cache & History
            </strong>
            <p style={{ margin: "2px 0 0", color: "var(--error-text)", fontSize: "var(--fs-xs)", opacity: 0.9 }}>
              Removes stored offline audio buffers, search history, and temporary artwork.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={handlePurgeCache}>
            Purge Cache
          </Button>
        </div>
      </div>
    </div>
  );
}
