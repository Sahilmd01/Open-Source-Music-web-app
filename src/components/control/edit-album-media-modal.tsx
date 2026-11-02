"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CameraIcon, ImageIcon } from "@/components/icons";
import type { AlbumItem } from "./control-types";

interface EditAlbumMediaModalProps {
  open: boolean;
  album: AlbumItem | null;
  onClose: () => void;
  onSave: (updated: AlbumItem) => Promise<void> | void;
}

export function EditAlbumMediaModal({
  open,
  album,
  onClose,
  onSave,
}: EditAlbumMediaModalProps) {
  const [coverUrl, setCoverUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (album) {
      setCoverUrl(album.coverUrl || "");
      setBannerUrl(album.bannerUrl || "");
      setIsSaving(false);
    }
  }, [album]);

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
    if (!album || isSaving) return;
    setIsSaving(true);
    try {
      await onSave({
        ...album,
        coverUrl: coverUrl || album.coverUrl,
        bannerUrl: bannerUrl,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={`Manage Media — ${album?.title || ""}`}
      onClose={isSaving ? () => {} : onClose}
      maxWidth={520}
      actions={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", width: "100%" }}>
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} loading={isSaving} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      }
    >
      {album && (
        <div style={{ display: "grid", gap: "var(--space-4)", padding: "var(--space-2) 0" }}>
          {/* Live Preview Header */}
          <div
            style={{
              position: "relative",
              height: 120,
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              background: bannerUrl
                ? `url(${bannerUrl}) center/cover no-repeat`
                : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
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
                  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
                }
                alt={album.title}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "8px",
                  objectFit: "cover",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  background: "var(--bg-surface-3)",
                }}
              />
              <div style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                <div style={{ fontWeight: "var(--fw-bold)", color: "#fff", fontSize: "var(--fs-sm)" }}>
                  {album.title}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)" }}>
                  {album.artist} • {album.year}
                </div>
              </div>
            </div>
          </div>

          {/* Upload Dropzones */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)" }}>
            {/* Cover Artwork Dropzone */}
            <div className="field">
              <label className="label">Upload Cover Art</label>
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
                      Change Cover
                    </span>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "8px",
                        background: "var(--bg-surface-3)",
                        display: "grid",
                        placeItems: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <CameraIcon width={20} height={20} />
                    </div>
                    <span className="text-small" style={{ fontWeight: "var(--fw-medium)" }}>Upload Cover</span>
                    <span className="hint" style={{ fontSize: "0.68rem" }}>Square artwork</span>
                  </>
                )}
              </div>
            </div>

            {/* Banner Dropzone */}
            <div className="field">
              <label className="label">Upload Banner</label>
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
                    <span className="hint" style={{ fontSize: "0.68rem" }}>Header banner</span>
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
