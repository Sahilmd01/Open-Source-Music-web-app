"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CameraIcon, CloseIcon } from "@/components/icons";
import { CoverArt } from "@/components/ui/cover-art";
import { ImageEditorModal } from "@/app/(app)/playlists/image-editor-modal";
import type { SongItem } from "./control-types";

interface EditSongMediaModalProps {
  open: boolean;
  song: SongItem | null;
  onClose: () => void;
  onSave: (updated: SongItem) => Promise<void> | void;
}

export function EditSongMediaModal({
  open,
  song,
  onClose,
  onSave,
}: EditSongMediaModalProps) {
  const [coverUrl, setCoverUrl] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [rawImage, setRawImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (song) {
      setCoverUrl(song.coverImage || "");
      setIsSaving(false);
    }
  }, [song]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setRawImage(result);
        setEditorOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleEditorSave = (croppedDataUrl: string) => {
    setCoverUrl(croppedDataUrl);
    setEditorOpen(false);
  };

  const handleSave = async () => {
    if (!song || isSaving) return;
    setIsSaving(true);
    try {
      await onSave({
        ...song,
        coverImage: coverUrl.trim() || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        title={`Change Cover Image — ${song?.title || ""}`}
        onClose={isSaving ? () => {} : onClose}
        maxWidth={460}
        actions={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} loading={isSaving} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Cover"}
            </Button>
          </div>
        }
      >
        {song && (
          <div style={{ display: "grid", gap: "var(--space-3)", padding: "4px 0" }}>
            {/* Live Preview Card (Compressed UI) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-3)",
                background: "var(--bg-surface-2)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  flexShrink: 0,
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid var(--border-subtle)",
                  position: "relative",
                  background: "var(--bg-surface-3)",
                }}
              >
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={song.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <CoverArt
                    hue={song.hue || 24}
                    size={64}
                    style={{ width: "100%", height: "100%" }}
                  />
                )}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <h4
                  style={{
                    margin: 0,
                    fontSize: "var(--fs-sm)",
                    fontWeight: "var(--fw-semibold)",
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {song.title}
                </h4>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "var(--fs-xs)",
                    color: "var(--text-secondary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {song.artist} • {song.album}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 4,
                    fontSize: "0.68rem",
                    color: "var(--text-muted)",
                  }}
                >
                  Uploader: {song.uploadedBy || "Official"}
                </span>
              </div>
            </div>

            {/* Dropzone for Cover Upload */}
            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <label className="field__label" style={{ fontSize: "0.75rem", margin: 0 }}>
                  Upload Cover Artwork (1:1 Square)
                </label>
                {coverUrl && (
                  <button
                    type="button"
                    onClick={() => setCoverUrl("")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: "0.68rem",
                    }}
                    title="Remove artwork"
                  >
                    <CloseIcon width={12} height={12} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />

              <div
                onClick={() => coverInputRef.current?.click()}
                style={{
                  border: "1px dashed var(--border-default)",
                  borderRadius: "var(--radius-sm)",
                  padding: "var(--space-3)",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--bg-surface-2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  height: 100,
                  justifyContent: "center",
                  transition: "border-color 0.15s ease",
                }}
              >
                {coverUrl ? (
                  <>
                    <img
                      src={coverUrl}
                      alt="Cover Preview"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "var(--radius-xs)",
                        objectFit: "cover",
                        border: "1px solid var(--border-subtle)",
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--brand)", fontWeight: 500 }}>Change</span>
                      <span
                        style={{ fontSize: "0.72rem", color: "var(--text-muted)", textDecoration: "underline" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRawImage(coverUrl);
                          setEditorOpen(true);
                        }}
                      >
                        Crop / Adjust
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "var(--radius-xs)",
                        background: "var(--bg-surface-3)",
                        display: "grid",
                        placeItems: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <CameraIcon width={16} height={16} />
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>Select New Image</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Square PNG or JPG (Capped for cloud storage)</span>
                  </>
                )}
              </div>
            </div>

            {/* Direct URL Input */}
            <div className="field">
              <label className="field__label" htmlFor="edit-song-cover-url" style={{ fontSize: "0.72rem", marginBottom: 2 }}>
                Or Direct Image URL
              </label>
              <input
                id="edit-song-cover-url"
                type="url"
                className="input"
                style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                placeholder="https://..."
                value={coverUrl.startsWith("data:") ? "" : coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Embedded Cropper / Image Editor (Square 1:1) */}
      <ImageEditorModal
        open={editorOpen}
        imageSrc={rawImage}
        type="logo"
        onClose={() => setEditorOpen(false)}
        onSave={handleEditorSave}
      />
    </>
  );
}
