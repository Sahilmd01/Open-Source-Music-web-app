"use client";

import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CameraIcon, ImageIcon } from "@/components/icons";
import type { Playlist } from "@/types/music";
import { ImageEditorModal } from "./image-editor-modal";

interface CreatePlaylistModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (playlist: Playlist) => Promise<void> | void;
}

export function CreatePlaylistModal({ open, onClose, onCreate }: CreatePlaylistModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editor states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorType, setEditorType] = useState<"logo" | "banner">("logo");
  const [rawImage, setRawImage] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, type: "logo" | "banner") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRawImage(reader.result as string);
        setEditorType(type);
        setEditorOpen(true);
      };
      reader.readAsDataURL(file);
    }
    // reset input so user can reselect same image if needed
    e.target.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newPlaylist: Playlist = {
        id: `pl-user-${Date.now()}`,
        title: cleanTitle.slice(0, 20),
        description: (description.trim() || "My personal playlist").slice(0, 50),
        likes: 1,
        songCount: 0,
        durationLabel: "0 min",
        hue: Math.floor(Math.random() * 360),
        logo: logo || undefined,
        coverImage: banner || undefined,
        isCustom: true,
      };

      await onCreate(newPlaylist);
      setTitle("");
      setDescription("");
      setLogo("");
      setBanner("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        title="Create New Playlist"
        onClose={isSubmitting ? () => {} : onClose}
        actions={
          <>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create playlist"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-3)" }}>
          {/* Title (max 20 chars) */}
          <div className="field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="label" htmlFor="pl-title">Title</label>
              <span className="hint">{title.length}/20</span>
            </div>
            <input
              id="pl-title"
              className="input"
              type="text"
              maxLength={20}
              placeholder="e.g. Synthwave Night"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Description (max 50 chars) */}
          <div className="field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="label" htmlFor="pl-desc">Description</label>
              <span className="hint">{description.length}/50</span>
            </div>
            <textarea
              id="pl-desc"
              className="textarea"
              maxLength={50}
              rows={2}
              placeholder="Give your playlist a mood..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: 65 }}
            />
          </div>

          {/* Enhanced Artwork Upload Section */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            {/* Logo Dropzone */}
            <div className="field">
              <label className="label">Playlist Logo</label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e, "logo")}
              />
              <div
                onClick={() => logoInputRef.current?.click()}
                style={{
                  border: "1px dashed var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3)",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--bg-surface-2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  transition: "border-color 0.15s ease",
                }}
              >
                {logo ? (
                  <>
                    <img
                      src={logo}
                      alt="Logo preview"
                      style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", boxShadow: "var(--shadow-sm)" }}
                    />
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span className="text-small" style={{ color: "var(--brand)" }}>Change</span>
                      <span
                        className="text-small text-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRawImage(logo);
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
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "var(--bg-surface-3)",
                        display: "grid",
                        placeItems: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <CameraIcon width={20} height={20} />
                    </div>
                    <span className="text-small" style={{ fontWeight: "var(--fw-medium)" }}>Upload Logo</span>
                    <span className="hint" style={{ fontSize: "0.68rem" }}>Square or circular</span>
                  </>
                )}
              </div>
            </div>

            {/* Banner Dropzone */}
            <div className="field">
              <label className="label">Playlist Banner</label>
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
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3)",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--bg-surface-2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  transition: "border-color 0.15s ease",
                }}
              >
                {banner ? (
                  <>
                    <img
                      src={banner}
                      alt="Banner preview"
                      style={{ width: "100%", height: 56, borderRadius: "var(--radius-xs)", objectFit: "cover", boxShadow: "var(--shadow-sm)" }}
                    />
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span className="text-small" style={{ color: "var(--brand)" }}>Change</span>
                      <span
                        className="text-small text-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRawImage(banner);
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
                        width: 44,
                        height: 44,
                        borderRadius: "var(--radius-xs)",
                        background: "var(--bg-surface-3)",
                        display: "grid",
                        placeItems: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <ImageIcon width={20} height={20} />
                    </div>
                    <span className="text-small" style={{ fontWeight: "var(--fw-medium)" }}>Upload Banner</span>
                    <span className="hint" style={{ fontSize: "0.68rem" }}>Header artwork</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Adjustment Precision Editor Modal */}
      {editorOpen && (
        <ImageEditorModal
          open={editorOpen}
          imageSrc={rawImage}
          type={editorType}
          onClose={() => setEditorOpen(false)}
          onSave={(croppedUrl) => {
            if (editorType === "logo") {
              setLogo(croppedUrl);
            } else {
              setBanner(croppedUrl);
            }
          }}
        />
      )}
    </>
  );
}
