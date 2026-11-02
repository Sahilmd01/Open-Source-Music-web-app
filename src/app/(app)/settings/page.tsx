"use client";

import { useState, useEffect } from "react";
import { RotateCcwIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/toast-provider";
import {
  SettingsHero,
  AudioSettingsTab,
  NotificationSettingsTab,
  PrivacySettingsTab,
  DEFAULT_PREFERENCES,
  SETTINGS_STORAGE_KEY,
  type UserPreferences,
  type SettingsTab,
} from "@/components/settings";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "audio", label: "Audio & Playback" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>("audio");
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  // Load preferences from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        setPrefs((prev) => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch {
      // ignore
    }
  }, []);

  const updatePref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleResetDefaults = () => {
    setPrefs(DEFAULT_PREFERENCES);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
    } catch {
      // ignore
    }
    toast({
      kind: "info",
      title: "Settings reset",
      description: "Preferences returned to default values.",
    });
  };

  return (
    <div className="settings-page" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Settings Hero Banner */}
      <SettingsHero />

      {/* Navigation Tabs Bar */}
      <div
        className="settings-tabs"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "var(--space-3)",
        }}
      >
        <div className="segmented settings-tabs__segmented" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              className={activeTab === t.id ? "is-active" : ""}
              onClick={() => setActiveTab(t.id)}
              style={{ fontWeight: "var(--fw-medium)", textTransform: "capitalize" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="settings-tabs__reset-btn"
          leadingIcon={<RotateCcwIcon width={14} height={14} />}
          onClick={handleResetDefaults}
        >
          Reset Preferences
        </Button>
      </div>

      {/* Main Settings Panel: Render active tab component */}
      <div className="settings-content" style={{ display: "grid", gap: "var(--space-6)" }}>
        {activeTab === "audio" && (
          <AudioSettingsTab prefs={prefs} onUpdatePref={updatePref} />
        )}
        {activeTab === "notifications" && (
          <NotificationSettingsTab prefs={prefs} onUpdatePref={updatePref} />
        )}
        {activeTab === "privacy" && (
          <PrivacySettingsTab prefs={prefs} onUpdatePref={updatePref} />
        )}
      </div>
    </div>
  );
}
