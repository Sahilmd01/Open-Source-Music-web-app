"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/providers/toast-provider";
import { useUiStore } from "@/stores/ui-store";
import type { ProfileData } from "./profile-types";

export type UsernameStatus = "idle" | "checking" | "available" | "unavailable";

interface UseGeneralInfoOptions {
  profile: ProfileData;
  onUpdateProfile: (partial: Partial<ProfileData>) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function useGeneralInfoForm({
  profile,
  onUpdateProfile,
  onDirtyChange,
}: UseGeneralInfoOptions) {
  const { toast } = useToast();
  const login = useUiStore((s) => s.login);

  const [name, setName] = useState(profile.name || "");
  const [username, setUsername] = useState(profile.username || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [isSaving, setIsSaving] = useState(false);

  // Real-time username check state
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [usernameFeedback, setUsernameFeedback] = useState<string>("");

  // Determine if fields differ from saved profile
  const isNameChanged = name.trim() !== (profile.name || "").trim();
  const isUsernameChanged = username.trim().toLowerCase() !== (profile.username || "").trim().toLowerCase();
  const isBioChanged = (bio || "").trim() !== (profile.bio || "").trim();
  const isPhoneChanged = (phone || "").trim() !== (profile.phone || "").trim();

  const isDirty = isNameChanged || isUsernameChanged || isBioChanged || isPhoneChanged;

  // Notify parent of dirty state
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Sync state if profile prop updates from API
  useEffect(() => {
    setName(profile.name || "");
    setUsername(profile.username || "");
    setBio(profile.bio || "");
    setPhone(profile.phone || "");
  }, [profile.name, profile.username, profile.bio, profile.phone]);

  // Discard changes and revert to saved profile
  const resetForm = useCallback(() => {
    setName(profile.name || "");
    setUsername(profile.username || "");
    setBio(profile.bio || "");
    setPhone(profile.phone || "");
    setUsernameStatus("idle");
    setUsernameFeedback("");
  }, [profile.name, profile.username, profile.bio, profile.phone]);

  // Real-time Gmail-style debounced username check
  useEffect(() => {
    const clean = username.trim().toLowerCase();

    // If unchanged from currently saved username, it's valid
    if (clean === (profile.username || "").toLowerCase()) {
      setUsernameStatus("idle");
      setUsernameFeedback("");
      return;
    }

    if (!clean) {
      setUsernameStatus("idle");
      setUsernameFeedback("");
      return;
    }

    if (clean.length < 3) {
      setUsernameStatus("unavailable");
      setUsernameFeedback("Min 3 characters");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      setUsernameStatus("unavailable");
      setUsernameFeedback("Letters, numbers, and _ only");
      return;
    }

    setUsernameStatus("checking");
    setUsernameFeedback("Checking...");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus("available");
          setUsernameFeedback("Available");
        } else {
          setUsernameStatus("unavailable");
          setUsernameFeedback(data.error || "Taken");
        }
      } catch {
        setUsernameStatus("idle");
        setUsernameFeedback("");
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, profile.username]);

  // Handle Form Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isDirty) return;

    if (usernameStatus === "unavailable") {
      toast({
        kind: "error",
        title: "Username taken",
        description: "Please choose an available username before saving.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          bio,
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          kind: "error",
          title: "Update failed",
          description: data.error || "Could not save profile changes.",
        });
        setIsSaving(false);
        return;
      }

      onUpdateProfile({ name, username, bio, phone });
      login({ name, username, email: profile.email });
      setIsSaving(false);
      setUsernameStatus("idle");
      toast({
        kind: "success",
        title: "Profile saved",
        description: "Your details have been synced with the database.",
      });
    } catch (err: any) {
      console.error("Profile save error:", err);
      toast({
        kind: "error",
        title: "Connection error",
        description: "Failed to connect to the server.",
      });
      setIsSaving(false);
    }
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val.toLowerCase().replace(/[^a-z0-9_]/g, ""));
  };

  return {
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
  };
}
