"use client";

import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ImageIcon, CameraIcon } from "@/components/icons";
import type { Album } from "@/types/music";
import { ImageEditorModal } from "../playlists/image-editor-modal";
import { MultiArtistSelect, type ArtistOption } from "@/components/features/multi-artist-select";

interface CreateAlbumModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (album: Album) => Promise<void> | void;
}

export function CreateAlbumModal({ open, onClose, onCreate }: CreateAlbumModalProps) {
  const [title, setTitle] = useState("");
  const [selectedArtists, setSelectedArtists] = useState<ArtistOption[]>([]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const artistName =
        selectedArtists.length > 0
          ? selectedArtists.map((a) => a.name.trim()).join(", ")
          : "Various Artists";

      const newAlbum: Album = {
        id: `al-user-${Date.now()}`,
        title: cleanTitle.slice(0, 50),
        artist: artistName.slice(0, 50),
        artistIds: selectedArtists.map((a) => a.id),
        artists: selectedArtists.map((a) => ({ id: a.id, name: a.name })),
        year: parseInt(year, 10) || new Date().getFullYear(),
        hue: Math.floor(Math.random() * 360),
        coverImage: avatar || undefined,
        avatarUrl: avatar || undefined,
        bannerUrl: banner || undefined,
        isCustom: true,
      };

      await onCreate(newAlbum);
      setTitle("");
      setSelectedArtists([]);
      setYear(new Date().getFullYear().toString());
      setAvatar("");
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
        title="Create New Album"
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
              {isSubmitting ? "Creating..." : "Create album"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-3)" }}>
          {/* Title */}
          <div className="field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="label" htmlFor="al-title">Album Title</label>
              <span className="hint">{title.length}/30</span>
            </div>
            <input
              id="al-title"
              className="input"
              type="text"
              maxLength={30}
              placeholder="e.g. Midnight Echoes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Artist & Year Row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-3)" }}>
            <MultiArtistSelect
              selectedArtists={selectedArtists}
              onChange={setSelectedArtists}
              maxArtists={5}
            />

            <div className="field">
              <label className="label" htmlFor="al-year">Year</label>
              <input
                id="al-year"
                className="input"
                type="number"
                min="1900"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          {/* Dual Media Section: Avatar & Banner */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            {/* Album Avatar / Square Cover Dropzone */}
            <div className="field">
              <label className="label">Album Avatar / Cover</label>
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
                  minHeight: 120,
                  justifyContent: "center",
                }}
              >
                {avatar ? (
                  <>
                    <img
                      src={avatar}
                      alt="Avatar preview"
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: "var(--radius-sm)",
                        objectFit: "cover",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    />
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span className="text-small" style={{ color: "var(--brand)" }}>Change</span>
                      <span
                        className="text-small text-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRawImage(avatar);
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
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-surface-3)",
                        display: "grid",
                        placeItems: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <CameraIcon width={20} height={20} />
                    </div>
                    <span className="text-small" style={{ fontWeight: "var(--fw-medium)" }}>Upload Avatar</span>
                    <span className="hint" style={{ fontSize: "0.68rem" }}>1:1 Square Cover</span>
                  </>
                )}
              </div>
            </div>

            {/* Album Banner Dropzone */}
            <div className="field">
              <label className="label">Album Header Banner</label>
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
                  minHeight: 120,
                  justifyContent: "center",
                }}
              >
                {banner ? (
                  <>
                    <img
                      src={banner}
                      alt="Banner preview"
                      style={{
                        width: "100%",
                        height: 58,
                        borderRadius: "var(--radius-xs)",
                        objectFit: "cover",
                        boxShadow: "var(--shadow-sm)",
                      }}
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
                    <span className="hint" style={{ fontSize: "0.68rem" }}>Wide landscape header</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Dedicated Precision Image Editor */}
      {editorOpen && (
        <ImageEditorModal
          open={editorOpen}
          imageSrc={rawImage}
          type={editorType}
          onClose={() => setEditorOpen(false)}
          onSave={(croppedUrl) => {
            if (editorType === "logo") {
              setAvatar(croppedUrl);
            } else {
              setBanner(croppedUrl);
            }
          }}
        />
      )}
    </>
  );
}
