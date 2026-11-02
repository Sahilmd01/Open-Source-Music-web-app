"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CameraIcon, ImageIcon } from "@/components/icons";
import type { PlaylistItem } from "./control-types";

interface EditPlaylistMediaModalProps {
  open: boolean;
  playlist: PlaylistItem | null;
  onClose: () => void;
  onSave: (updated: PlaylistItem) => Promise<void> | void;
}

export function EditPlaylistMediaModal({
  open,
  playlist,
  onClose,
  onSave,
}: EditPlaylistMediaModalProps) {
  const [coverUrl, setCoverUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (playlist) {
      setCoverUrl(playlist.coverUrl || "");
      setBannerUrl(playlist.bannerUrl || "");
      setIsSaving(false);
    }
  }, [playlist]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, type: "cover" | "banner") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (type === "cover") {
          setCoverUrl(result);
        } else {
          setBannerUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!playlist || isSaving) return;
    setIsSaving(true);
    try {
      await onSave({
        ...playlist,
        coverUrl: coverUrl || playlist.coverUrl,
        bannerUrl: bannerUrl,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={`Manage Media — ${playlist?.title || ""}`}
      onClose={isSaving ? () => {} : onClose}
      maxWidth={520}
      actions={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", width: "100%" }}>
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} loading={isSaving} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Media"}
          </Button>
        </div>
      }
    >
      {playlist && (
        <div style={{ display: "grid", gap: "var(--space-4)", padding: "var(--space-2) 0" }}>
          {/* Live Visual Preview Box */}
          <div
            style={{
              height: 110,
              width: "100%",
              borderRadius: "var(--radius-md)",
              background: bannerUrl
                ? `url('${bannerUrl}') center/cover no-repeat`
                : "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
              position: "relative",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "flex-end",
              padding: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <img
                src={
                  coverUrl ||
                  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=80"
                }
                alt={playlist.title}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "8px",
                  objectFit: "cover",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  background: "var(--bg-surface-3)",
                }}
              />
              <div style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                <div style={{ fontWeight: "var(--fw-bold)", color: "#fff", fontSize: "var(--fs-sm)" }}>
                  {playlist.title}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)" }}>
                  Live Preview
                </div>
              </div>
            </div>
          </div>

          {/* Upload Dropzones */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)" }}>
            {/* Playlist Cover Avatar Dropzone */}
            <div className="field">
              <label className="label">Upload Cover Avatar</label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e, "cover")}
              />
              <div
                onClick={() => coverInputRef.current?.click()}
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
                  gap: "8px",
                  transition: "border-color 0.15s ease",
                  minHeight: 120,
                  justifyContent: "center",
                }}
              >
                {coverUrl ? (
                  <>
                    <img
                      src={coverUrl}
                      alt="Cover preview"
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "8px",
                        objectFit: "cover",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    />
                    <span className="text-small" style={{ color: "var(--brand)", fontWeight: "var(--fw-medium)" }}>
                      Change Avatar
                    </span>
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
                    <span className="text-small" style={{ fontWeight: "var(--fw-medium)" }}>Upload Avatar</span>
                    <span className="hint" style={{ fontSize: "0.68rem" }}>Square logo or icon</span>
                  </>
                )}
              </div>
            </div>

            {/* Banner Dropzone */}
            <div className="field">
              <label className="label">Upload Header Banner</label>
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
                  gap: "8px",
                  transition: "border-color 0.15s ease",
                  minHeight: 120,
                  justifyContent: "center",
                }}
              >
                {bannerUrl ? (
                  <>
                    <img
                      src={bannerUrl}
                      alt="Banner preview"
                      style={{
                        width: "100%",
                        height: 54,
                        borderRadius: "var(--radius-xs)",
                        objectFit: "cover",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    />
                    <span className="text-small" style={{ color: "var(--brand)", fontWeight: "var(--fw-medium)" }}>
                      Change Banner
                    </span>
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
                    <span className="hint" style={{ fontSize: "0.68rem" }}>Wide header banner</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
