"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { CameraIcon, UploadCloudIcon, CheckIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/toast-provider";
import { useUiStore } from "@/stores/ui-store";
import { ImagePreviewModal } from "./image-preview-modal";
import { type ProfileData, DEFAULT_AVATAR_PATH, DEFAULT_BANNER_PATH, PROFILE_STORAGE_KEY } from "./profile-types";

interface AvatarBannerTabProps {
  profile: ProfileData;
  onUpdateProfile: (partial: Partial<ProfileData>) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

// Helper to convert base64 / dataURL to a File object for multipart upload
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0]?.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const b64Data = arr[1] || "";
  const bstr = atob(b64Data);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function AvatarBannerTab({ profile, onUpdateProfile, onDirtyChange }: AvatarBannerTabProps) {
  const { toast } = useToast();
  const user = useUiStore((s) => s.user);
  const login = useUiStore((s) => s.login);

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState(
    profile.avatarUrl && profile.avatarUrl.trim() !== "" ? profile.avatarUrl : DEFAULT_AVATAR_PATH
  );
  const [bannerPreview, setBannerPreview] = useState(
    profile.bannerUrl && profile.bannerUrl.trim() !== "" ? profile.bannerUrl : DEFAULT_BANNER_PATH
  );
  const [avatarFileName, setAvatarFileName] = useState<string>("");
  const [bannerFileName, setBannerFileName] = useState<string>("");

  // Track modified files
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Notify parent of dirty / unsaved changes
  useEffect(() => {
    onDirtyChange?.(hasChanges);
  }, [hasChanges, onDirtyChange]);

  // Sync previews if profile data changes from backend
  useEffect(() => {
    if (!pendingAvatarFile) {
      setAvatarPreview(profile.avatarUrl && profile.avatarUrl.trim() !== "" ? profile.avatarUrl : DEFAULT_AVATAR_PATH);
    }
    if (!pendingBannerFile) {
      setBannerPreview(profile.bannerUrl && profile.bannerUrl.trim() !== "" ? profile.bannerUrl : DEFAULT_BANNER_PATH);
    }
  }, [profile.avatarUrl, profile.bannerUrl, pendingAvatarFile, pendingBannerFile]);

  // Preview & Crop modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string>("");
  const [editorType, setEditorType] = useState<"avatar" | "banner">("avatar");

  // Handle local avatar file picker
  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        kind: "error",
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, WEBP).",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        kind: "error",
        title: "File too large",
        description: "Image size must be smaller than 20MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl) {
        setRawImageSrc(dataUrl);
        setEditorType("avatar");
        setAvatarFileName(file.name);
        setPendingAvatarFile(file);
        setAvatarPreview(dataUrl);
        setHasChanges(true);
        setModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Handle local banner file picker
  const handleBannerFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        kind: "error",
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, WEBP).",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        kind: "error",
        title: "File too large",
        description: "Banner image size must be smaller than 20MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl) {
        setRawImageSrc(dataUrl);
        setEditorType("banner");
        setBannerFileName(file.name);
        setPendingBannerFile(file);
        setBannerPreview(dataUrl);
        setHasChanges(true);
        setModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Callback after user crops/resizes in the preview modal
  const handleEditorSave = (croppedDataUrl: string) => {
    if (editorType === "avatar") {
      setAvatarPreview(croppedDataUrl);
      const safeName = avatarFileName ? `avatar-${avatarFileName.replace(/\.[^/.]+$/, "")}.jpg` : "avatar.jpg";
      const convertedFile = dataURLtoFile(croppedDataUrl, safeName);
      setPendingAvatarFile(convertedFile);
    } else {
      setBannerPreview(croppedDataUrl);
      const safeName = bannerFileName ? `banner-${bannerFileName.replace(/\.[^/.]+$/, "")}.jpg` : "banner.jpg";
      const convertedFile = dataURLtoFile(croppedDataUrl, safeName);
      setPendingBannerFile(convertedFile);
    }
    setHasChanges(true);

    toast({
      kind: "success",
      title: `${editorType === "avatar" ? "Avatar" : "Banner"} adjusted`,
      description: "Click 'Save Changes' to upload and persist your images.",
    });
  };

  // Helper function to upload file using storage API
  const uploadToStorage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/v1/storage/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to upload file to storage.");
    }

    return data.data.url; // e.g. /api/v1/storage/<fileUuid>
  };

  const handleSaveMedia = async () => {
    setIsUploading(true);
    try {
      let finalAvatarUrl = profile.avatarUrl;
      let finalBannerUrl = profile.bannerUrl;

      // 1. Upload Avatar if changed
      if (pendingAvatarFile) {
        setUploadStatusText("Uploading avatar ...");
        finalAvatarUrl = await uploadToStorage(pendingAvatarFile);
      }

      // 2. Upload Banner if changed
      if (pendingBannerFile) {
        setUploadStatusText("Uploading banner ...");
        finalBannerUrl = await uploadToStorage(pendingBannerFile);
      }

      setUploadStatusText("Saving profile details...");

      // 3. Save URLs in user profile
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl: finalAvatarUrl,
          bannerUrl: finalBannerUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not save profile images.");
      }

      // 4. Update local state and parent state
      setAvatarPreview(finalAvatarUrl);
      setBannerPreview(finalBannerUrl);
      setPendingAvatarFile(null);
      setPendingBannerFile(null);
      setHasChanges(false);

      const updatedPartial = {
        avatarUrl: finalAvatarUrl,
        bannerUrl: finalBannerUrl,
      };

      onUpdateProfile(updatedPartial);

      // Also persist to localStorage so it persists across refreshes immediately
      try {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        const prevObj = stored ? JSON.parse(stored) : {};
        localStorage.setItem(
          PROFILE_STORAGE_KEY,
          JSON.stringify({ ...prevObj, ...profile, ...updatedPartial })
        );
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }

      // Sync user session state across whole app
      if (user) {
        login({
          ...user,
          avatarUrl: finalAvatarUrl,
          bannerUrl: finalBannerUrl,
        });
      }

      toast({
        kind: "success",
        title: "Profile Media Saved!",
        description: "Your new avatar and banner are uploaded and permanently saved.",
      });
    } catch (err: any) {
      console.error("Save media error:", err);
      toast({
        kind: "error",
        title: "Upload Failed",
        description: err.message || "Failed to upload image. Please try again.",
      });
    } finally {
      setIsUploading(false);
      setUploadStatusText("");
    }
  };

  return (
    <div style={{ display: "grid", gap: "var(--space-6)", position: "relative" }}>
      {/* Uploading Full Overlay / Spinner */}
      {isUploading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10, 10, 15, 0.78)",
            backdropFilter: "blur(6px)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-3)",
            zIndex: 50,
            padding: "var(--space-6)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              border: "3px solid rgba(255, 92, 0, 0.25)",
              borderTopColor: "var(--brand)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)" }}>
              {uploadStatusText || "Uploading to Cloud Storage..."}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
              Please wait while your file is securely transferred to Cloude storage...
            </p>
          </div>
        </div>
      )}

      {/* Hidden Native File Inputs */}
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        style={{ display: "none" }}
        onChange={handleAvatarFileChange}
      />
      <input
        ref={bannerFileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        style={{ display: "none" }}
        onChange={handleBannerFileChange}
      />

      {/* Top Header with Save Changes Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-semibold)", margin: 0, color: "var(--text-primary)" }}>
            Avatar &amp; Banner
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
            Customize your visual profile presence across the Listenify platform.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          {hasChanges && !isUploading && (
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--brand)", fontWeight: "var(--fw-medium)" }}>
              Unsaved changes ready
            </span>
          )}
          <Button
            variant="primary"
            size="md"
            leadingIcon={
              isUploading ? (
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid #fff",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              ) : (
                <CheckIcon width={16} height={16} />
              )
            }
            disabled={!hasChanges || isUploading}
            onClick={handleSaveMedia}
          >
            {isUploading ? "Uploading... Please wait" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* 1. Simple Avatar Upload Card */}
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
            Profile Avatar
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
            Upload an image from your device. It will be securely stored via Telegram Cloud Storage.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", flexWrap: "wrap" }}>
          {/* Avatar Preview */}
          <div
            onClick={() => !isUploading && avatarFileInputRef.current?.click()}
            title="Click to choose image file"
            style={{
              position: "relative",
              cursor: isUploading ? "not-allowed" : "pointer",
              borderRadius: "50%",
              width: 96,
              height: 96,
              flexShrink: 0,
            }}
          >
            <img
              src={avatarPreview}
              alt="Avatar preview"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid var(--brand)",
                boxShadow: "var(--shadow-md)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                background: "var(--brand)",
                color: "#fff",
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                border: "2px solid var(--bg-surface-2)",
              }}
            >
              <CameraIcon width={14} height={14} />
            </div>
          </div>

          <div style={{ display: "grid", gap: "8px", flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              <Button
                variant="secondary"
                size="md"
                leadingIcon={<UploadCloudIcon width={16} height={16} />}
                onClick={() => avatarFileInputRef.current?.click()}
                disabled={isUploading}
              >
                Choose Avatar File
              </Button>

              {avatarPreview && (
                <Button
                  variant="ghost"
                  size="md"
                  disabled={isUploading}
                  onClick={() => {
                    setRawImageSrc(avatarPreview);
                    setEditorType("avatar");
                    setModalOpen(true);
                  }}
                >
                  Adjust & Crop
                </Button>
              )}
            </div>

            {avatarFileName ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "var(--fs-xs)",
                  color: "var(--brand)",
                  fontWeight: "var(--fw-medium)",
                }}
              >
                <CheckIcon width={14} height={14} />
                Selected: {avatarFileName}
              </span>
            ) : (
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
                Square circular frame (auto-scaled to 400×400px), up to 20MB.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Simple Banner Upload Card */}
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
            Profile Banner
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
            Upload a panoramic header cover from your device to crop, zoom, and re-center.
          </p>
        </div>

        {/* Banner Preview Area (Click to Upload or Adjust) */}
        <div
          onClick={() => !isUploading && bannerFileInputRef.current?.click()}
          title="Click to choose banner file from device"
          style={{
            position: "relative",
            width: "100%",
            height: 160,
            borderRadius: "var(--radius-md)",
            background: `url('${bannerPreview}') center/cover no-repeat`,
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-sm)",
            cursor: isUploading ? "not-allowed" : "pointer",
            overflow: "hidden",
            display: "flex",
            alignItems: "flex-end",
            padding: "var(--space-3)",
          }}
        >
          <div
            style={{
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              padding: "5px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--fs-xs)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <CameraIcon width={13} height={13} />
            {bannerFileName ? `Uploaded: ${bannerFileName}` : "Click to select or change banner file"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
            <Button
              variant="secondary"
              size="md"
              leadingIcon={<UploadCloudIcon width={16} height={16} />}
              onClick={() => bannerFileInputRef.current?.click()}
              disabled={isUploading}
            >
              Choose Banner File
            </Button>

            {bannerPreview && (
              <Button
                variant="ghost"
                size="md"
                disabled={isUploading}
                onClick={() => {
                  setRawImageSrc(bannerPreview);
                  setEditorType("banner");
                  setModalOpen(true);
                }}
              >
                Adjust & Re-center
              </Button>
            )}
          </div>

          {bannerFileName && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "var(--fs-xs)",
                color: "var(--brand)",
                fontWeight: "var(--fw-medium)",
              }}
            >
              <CheckIcon width={14} height={14} />
              Selected: {bannerFileName}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Crop / Resize / Preview Modal */}
      <ImagePreviewModal
        open={modalOpen}
        imageSrc={rawImageSrc}
        type={editorType}
        onClose={() => setModalOpen(false)}
        onSave={handleEditorSave}
      />
    </div>
  );
}
