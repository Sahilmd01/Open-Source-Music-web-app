"use client";

import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CameraIcon, ImageIcon, CloseIcon } from "@/components/icons";
import { ImageEditorModal } from "@/app/(app)/playlists/image-editor-modal";
import type { ArtistItem } from "./control-types";

interface AddArtistModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (artist: ArtistItem) => Promise<void> | void;
}

export function AddArtistModal({ open, onClose, onAdd }: AddArtistModalProps) {
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editor states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorType, setEditorType] = useState<"logo" | "banner">("logo");
  const [rawImage, setRawImage] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRawImage(reader.result as string);
        setEditorType(type === "avatar" ? "logo" : "banner");
        setEditorOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleEditorSave = (croppedDataUrl: string) => {
    if (editorType === "logo") {
      setAvatarUrl(croppedDataUrl);
    } else {
      setBannerUrl(croppedDataUrl);
    }
    setEditorOpen(false);
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onAdd({
        id: crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`,
        name: name.trim(),
        genre: genre.trim() || "Multi-genre",
        status: "active",
        followers: 0,
        avatarUrl:
          avatarUrl.trim() ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        bannerUrl: bannerUrl.trim() || undefined,
      });

      setName("");
      setGenre("");
      setAvatarUrl("");
      setBannerUrl("");
      setErrorMessage(null);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create artist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        title="Add New Artist"
        onClose={isSubmitting ? () => {} : onClose}
        maxWidth={500}
        actions={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!name.trim() || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Artist"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-2)", padding: "4px 0" }}>
          {errorMessage && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#ef4444",
                fontSize: "0.78rem",
                fontWeight: "var(--fw-medium)",
                lineHeight: 1.4,
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Dual Dropzone Row (Compressed UI) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: "var(--space-2)" }}>
            {/* Avatar Dropzone */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <label className="field__label" style={{ fontSize: "0.74rem", margin: 0 }}>Avatar (1:1)</label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}
                    title="Remove avatar"
                  >
                    <CloseIcon width={12} height={12} />
                  </button>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e, "avatar")}
              />
              <div
                onClick={() => avatarInputRef.current?.click()}
                style={{
                  border: "1px dashed var(--border-default)",
                  borderRadius: "var(--radius-sm)",
                  padding: "6px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--bg-surface-2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  height: 90,
                  justifyContent: "center",
                  transition: "border-color 0.15s ease",
                }}
              >
                {avatarUrl ? (
                  <>
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid var(--border-subtle)",
                      }}
                    />
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--brand)", fontWeight: 500 }}>Change</span>
                      <span
                        style={{ fontSize: "0.68rem", color: "var(--text-muted)", textDecoration: "underline" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRawImage(avatarUrl);
                          setEditorType("logo");
                          setEditorOpen(true);
                        }}
                      >
                        Adjust
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "var(--bg-surface-3)",
                        display: "grid",
                        placeItems: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <CameraIcon width={15} height={15} />
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 500 }}>Upload Avatar</span>
                    <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>Square Photo</span>
                  </>
                )}
              </div>
            </div>

            {/* Banner Dropzone */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <label className="field__label" style={{ fontSize: "0.74rem", margin: 0 }}>Banner (Wide)</label>
                {bannerUrl && (
                  <button
                    type="button"
                    onClick={() => setBannerUrl("")}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}
                    title="Remove banner"
                  >
                    <CloseIcon width={12} height={12} />
                  </button>
                )}
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e, "banner")}
              />
              <div
                onClick={() => bannerInputRef.current?.click()}
                style={{
                  border: "1px dashed var(--border-default)",
                  borderRadius: "var(--radius-sm)",
                  padding: "6px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--bg-surface-2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  height: 90,
                  justifyContent: "center",
                  transition: "border-color 0.15s ease",
                  overflow: "hidden",
                }}
              >
                {bannerUrl ? (
                  <>
                    <img
                      src={bannerUrl}
                      alt="Banner"
                      style={{
                        width: "88%",
                        height: 44,
                        borderRadius: "var(--radius-xs)",
                        objectFit: "cover",
                        border: "1px solid var(--border-subtle)",
                      }}
                    />
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--brand)", fontWeight: 500 }}>Change</span>
                      <span
                        style={{ fontSize: "0.68rem", color: "var(--text-muted)", textDecoration: "underline" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRawImage(bannerUrl);
                          setEditorType("banner");
                          setEditorOpen(true);
                        }}
                      >
                        Adjust
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-xs)",
                        background: "var(--bg-surface-3)",
                        display: "grid",
                        placeItems: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <ImageIcon width={16} height={16} />
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 500 }}>Upload Banner</span>
                    <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>16:9 Header</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Compressed Name & Genre Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--space-2)" }}>
            <div className="field">
              <label className="field__label" htmlFor="new-art-name" style={{ fontSize: "0.75rem", marginBottom: 3 }}>
                Artist Name *
              </label>
              <input
                id="new-art-name"
                type="text"
                className="input"
                required
                style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                placeholder="e.g. Luna Eclipse"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="new-art-genre" style={{ fontSize: "0.75rem", marginBottom: 3 }}>
                Primary Genre
              </label>
              <input
                id="new-art-genre"
                type="text"
                className="input"
                style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                placeholder="e.g. Pop / Ambient"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>
          </div>

          {/* Optional Direct URL Overrides (Collapsible or subtle input) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)", marginTop: 2 }}>
            <div className="field">
              <label className="field__label" htmlFor="new-art-avatar-url" style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 2 }}>
                Or Avatar URL
              </label>
              <input
                id="new-art-avatar-url"
                type="url"
                className="input"
                style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                placeholder="https://..."
                value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="new-art-banner-url" style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 2 }}>
                Or Banner URL
              </label>
              <input
                id="new-art-banner-url"
                type="url"
                className="input"
                style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                placeholder="https://..."
                value={bannerUrl.startsWith("data:") ? "" : bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Embedded Cropper / Image Editor */}
      <ImageEditorModal
        open={editorOpen}
        imageSrc={rawImage}
        type={editorType}
        onClose={() => setEditorOpen(false)}
        onSave={handleEditorSave}
      />
    </>
  );
}
