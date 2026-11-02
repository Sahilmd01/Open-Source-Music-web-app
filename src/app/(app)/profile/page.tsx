"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon, UserIcon, LockIcon, AlertIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/providers/toast-provider";
import {
  ProfileHero,
  GeneralInfoTab,
  AvatarBannerTab,
  SecurityTab,
  VerifyAccountModal,
  INITIAL_PROFILE,
  PROFILE_STORAGE_KEY,
  type ProfileData,
  type ProfileTab,
} from "@/components/profile";
import { useUiStore } from "@/stores/ui-store";

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "general", label: "General & About" },
  { id: "avatar-banner", label: "Avatar & Banner" },
  { id: "security", label: "Password & Security" },
];

export default function MyProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useUiStore((s) => s.user);
  const isAuthenticated = useUiStore((s) => s.isAuthenticated);
  const isAuthLoading = useUiStore((s) => s.isAuthLoading);
  const openLoginModal = useUiStore((s) => s.openLoginModal);
  const openSignupModal = useUiStore((s) => s.openSignupModal);
  const logout = useUiStore((s) => s.logout);

  const [activeTab, setActiveTab] = useState<ProfileTab>("general");
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // Unsaved changes tracking across tabs
  const [isGeneralDirty, setIsGeneralDirty] = useState(false);
  const [isAvatarDirty, setIsAvatarDirty] = useState(false);
  const [pendingTabSwitch, setPendingTabSwitch] = useState<ProfileTab | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const hasUnsavedChanges = isGeneralDirty || isAvatarDirty;

  // Browser level beforeunload prompt when navigating away or refreshing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Tab switch handler with confirmation
  const handleTabClick = (tabId: ProfileTab) => {
    if (tabId === activeTab) return;
    if (hasUnsavedChanges) {
      setPendingTabSwitch(tabId);
      setShowDiscardModal(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const handleConfirmDiscard = () => {
    setIsGeneralDirty(false);
    setIsAvatarDirty(false);
    setShowDiscardModal(false);
    if (pendingTabSwitch) {
      setActiveTab(pendingTabSwitch);
      setPendingTabSwitch(null);
    }
    toast({
      kind: "info",
      title: "Changes Discarded",
      description: "Unsaved changes were cleared.",
    });
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
    setPendingTabSwitch(null);
  };

  const handleLogout = () => {
    if (hasUnsavedChanges) {
      setPendingTabSwitch(null);
      setShowDiscardModal(true);
      return;
    }
    logout();
    toast({
      kind: "info",
      title: "Logged out",
      description: "You have been logged out of your session.",
    });
    router.push("/");
  };

  const handleOpenVerify = () => {
    setIsVerifyModalOpen(true);
    toast({
      kind: "info",
      title: "OTP sent!",
      description: "Please check your email for the 6-digit verification code.",
    });
  };

  const handleVerified = () => {
    updateProfile({ isVerified: true });
    toast({
      kind: "success",
      title: "Account Verified!",
      description: "You can now upload music and create public playlists.",
    });
  };

  // Load from backend /api/user/profile with fallback to local storage
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    async function loadBackendProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile && isMounted) {
            setProfile(data.profile);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load profile from backend:", err);
      }

      if (isMounted) {
        try {
          const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
          if (stored) {
            setProfile((prev) => ({ ...prev, ...JSON.parse(stored) }));
          } else if (user) {
            setProfile((prev) => ({
              ...prev,
              name: user.name,
              email: user.email,
            }));
          }
        } catch {
          // ignore
        }
      }
    }

    loadBackendProfile();

    return () => {
      isMounted = false;
    };
  }, [user, isAuthenticated]);

  const updateProfile = (partial: Partial<ProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // 1. Loading State while session is checking
  if (isAuthLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: "var(--space-4)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid var(--border-subtle)",
            borderTopColor: "var(--brand)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-sm)" }}>
          Checking authentication...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated Gate — Prompt user to Log In
  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          padding: "var(--space-6)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255, 92, 0, 0.15), rgba(255, 140, 0, 0.05))",
            border: "1px solid rgba(255, 92, 0, 0.3)",
            display: "grid",
            placeItems: "center",
            color: "var(--brand)",
            marginBottom: "var(--space-4)",
            boxShadow: "0 10px 30px rgba(255, 92, 0, 0.15)",
          }}
        >
          <LockIcon width={32} height={32} />
        </div>

        <h1
          style={{
            fontSize: "var(--fs-2xl)",
            fontWeight: "var(--fw-bold)",
            color: "var(--text-primary)",
            marginBottom: "var(--space-2)",
          }}
        >
          Sign in to view your profile
        </h1>
        <p
          style={{
            maxWidth: 440,
            fontSize: "var(--fs-sm)",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "var(--space-6)",
          }}
        >
          Your profile, sound collections, playlists, and security settings are protected. Log in or create an account to continue.
        </p>

        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}>
          <Button
            variant="primary"
            size="lg"
            leadingIcon={<UserIcon width={18} height={18} />}
            onClick={openLoginModal}
          >
            Log In Now
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={openSignupModal}
          >
            Create an Account
          </Button>
        </div>
      </div>
    );
  }

  // 3. Authenticated Content
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* 1. Header Banner & Identity Stats */}
      <ProfileHero profile={profile} onVerifyClick={handleOpenVerify} />

      {/* 2. Navigation Tabs Bar */}
      <div
        className="profile-tabs"
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
        <div className="segmented profile-tabs__segmented" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              className={activeTab === t.id ? "is-active" : ""}
              onClick={() => handleTabClick(t.id)}
              style={{ fontWeight: "var(--fw-medium)", textTransform: "capitalize" }}
            >
              {t.label}
              {((t.id === "general" && isGeneralDirty) || (t.id === "avatar-banner" && isAvatarDirty)) && (
                <span
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--brand)",
                    marginLeft: 6,
                    verticalAlign: "middle",
                  }}
                  title="Unsaved changes"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tab Content Panels */}
      <div style={{ display: "grid", gap: "var(--space-6)" }}>
        {activeTab === "general" && (
          <GeneralInfoTab
            profile={profile}
            onUpdateProfile={updateProfile}
            onDirtyChange={setIsGeneralDirty}
          />
        )}
        {activeTab === "avatar-banner" && (
          <AvatarBannerTab
            profile={profile}
            onUpdateProfile={updateProfile}
            onDirtyChange={setIsAvatarDirty}
          />
        )}
        {activeTab === "security" && <SecurityTab userEmail={profile.email} />}
      </div>

      {/* 4. Bottom Logout Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "var(--space-4)",
          borderTop: "1px solid var(--border-subtle)",
          marginTop: "var(--space-2)",
        }}
      >
        <Button
          variant="danger"
          size="md"
          className="profile-tabs__logout-btn"
          leadingIcon={<LogOutIcon width={16} height={16} />}
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>

      {/* 5. Unsaved Changes Confirmation Modal */}
      <Modal
        open={showDiscardModal}
        title="Unsaved Changes"
        onClose={handleCancelDiscard}
        maxWidth={460}
        actions={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", width: "100%" }}>
            <Button variant="secondary" size="md" onClick={handleCancelDiscard}>
              Keep Editing
            </Button>
            <Button variant="danger" size="md" onClick={handleConfirmDiscard}>
              Discard Changes
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", padding: "var(--space-2) 0" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <AlertIcon width={22} height={22} />
          </div>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>
              You have unsaved changes that will be lost.
            </p>
            <p style={{ margin: 0, fontSize: "var(--fs-xs)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Do you want to discard your changes and switch tabs, or stay on this page to save them?
            </p>
          </div>
        </div>
      </Modal>

      {/* 6. Verification OTP Modal */}
      <VerifyAccountModal
        isOpen={isVerifyModalOpen}
        userEmail={profile.email}
        onClose={() => setIsVerifyModalOpen(false)}
        onVerified={handleVerified}
      />
    </div>
  );
}
