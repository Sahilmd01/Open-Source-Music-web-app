"use client";

import { useState, useRef, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { UploadCloudIcon, MusicNoteIcon, CameraIcon, SearchIcon } from "@/components/icons";
import { ImageEditorModal } from "@/app/(app)/playlists/image-editor-modal";
import { useUiStore } from "@/stores/ui-store";
import type { Track } from "@/types/music";

interface AddMusicModalProps {
  open: boolean;
  containerTitle: string;
  onClose: () => void;
  onAddTrack: (track: Track) => void;
}

interface ArtistOption {
  id: string;
  name: string;
  imageUrl?: string;
}

export function AddMusicModal({ open, containerTitle, onClose, onAddTrack }: AddMusicModalProps) {
  const currentUser = useUiStore((s) => s.user);
  const [songName, setSongName] = useState("");

  // Artist search state
  const [artistSearch, setArtistSearch] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(null);
  const [artistOptions, setArtistOptions] = useState<ArtistOption[]>([]);
  const [isArtistDropdownOpen, setIsArtistDropdownOpen] = useState(false);
  const [isFetchingArtists, setIsFetchingArtists] = useState(false);
  const artistDropdownRef = useRef<HTMLDivElement>(null);

  const [uploadedByName, setUploadedByName] = useState("");
  const [audioFileName, setAudioFileName] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioSrc, setAudioSrc] = useState("");
  const [duration, setDuration] = useState(180);
  const [musicLogo, setMusicLogo] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Precision image editor states
  const [editorOpen, setEditorOpen] = useState(false);
  const [rawImage, setRawImage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill uploader name from logged-in user
  useEffect(() => {
    if (currentUser?.name) setUploadedByName(currentUser.name);
    else if (currentUser?.username) setUploadedByName(currentUser.username);
  }, [currentUser]);

  // Fetch artists from API
  const fetchArtists = useCallback(async (search: string) => {
    setIsFetchingArtists(true);
    try {
      const url = search.trim()
        ? `/api/control/artists?search=${encodeURIComponent(search.trim())}`
        : `/api/control/artists`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.artists)) {
        setArtistOptions(
          data.artists.map((a: any) => ({
            id: a.id,
            name: a.name,
            imageUrl: a.avatarUrl || a.image_url,
          }))
        );
      } else {
        setArtistOptions([]);
      }
    } catch {
      setArtistOptions([]);
    } finally {
      setIsFetchingArtists(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    if (!isArtistDropdownOpen) return;
    const timer = setTimeout(() => fetchArtists(artistSearch), 250);
    return () => clearTimeout(timer);
  }, [artistSearch, isArtistDropdownOpen, fetchArtists]);

  // Load all artists when dropdown first opens
  useEffect(() => {
    if (isArtistDropdownOpen) fetchArtists(artistSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArtistDropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (artistDropdownRef.current && !artistDropdownRef.current.contains(e.target as Node)) {
        setIsArtistDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleAudioSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|aac|ogg|wma)$/i.test(file.name);
      if (!isAudio) {
        alert("Please select a valid music file (e.g. .mp3, .wav, .flac).");
        e.target.value = "";
        return;
      }
      setAudioFileName(file.name);
      setAudioFile(file);
      if (!songName.trim()) {
        setSongName(file.name.replace(/\.[^/.]+$/, "").slice(0, 40));
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAudioSrc(dataUrl);
        const audio = new Audio();
        audio.src = dataUrl;
        audio.onloadedmetadata = () => {
          if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
            setDuration(Math.round(audio.duration));
          }
        };
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleLogoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRawImage(reader.result as string);
        setEditorOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = songName.trim();
    if (!cleanTitle) return;

    const generatedId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newTrack: Track = {
      id: generatedId,
      title: cleanTitle.slice(0, 40),
      artist: selectedArtist?.name || "Independent Artist",
      artistId: selectedArtist?.id,
      album: containerTitle,
      duration: duration || 180,
      hue: Math.floor(Math.random() * 360),
      uploadedBy: (uploadedByName.trim() || "You").slice(0, 30),
      audioSrc: audioSrc || undefined,
      audioFile: audioFile || undefined,
      coverImage: musicLogo || undefined,
    };

    onAddTrack(newTrack);
    setSongName("");
    setSelectedArtist(null);
    setArtistSearch("");
    setUploadedByName("");
    setAudioFileName("");
    setAudioFile(null);
    setAudioSrc("");
    setMusicLogo("");
    onClose();
  };

  const filteredArtists = artistOptions.filter((a) =>
    a.name.toLowerCase().includes(artistSearch.toLowerCase())
  );

  return (
    <>
      <Modal
        open={open}
        title="Upload Music"
        onClose={onClose}
        actions={
          <>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!songName.trim() || !agreeTerms}>
              Add to {containerTitle}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-3)" }}>

          {/* Audio + Logo row */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--space-3)" }}>
            {/* Audio File */}
            <div className="field">
              <label className="label">Music File (Audio Only)</label>
              <input ref={fileInputRef} type="file" accept=".mp3,audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/aac,audio/ogg,audio/m4a,audio/*" style={{ display: "none" }} onChange={handleAudioSelect} />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: audioFileName ? "1px solid var(--brand)" : "1px dashed var(--border-default)",
                  borderRadius: "var(--radius-md)", padding: "var(--space-3)", textAlign: "center",
                  cursor: "pointer", background: audioFileName ? "var(--accent-soft)" : "var(--bg-surface-2)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  minHeight: 110, gap: "6px", transition: "border-color 0.15s ease, background 0.15s ease",
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--bg-surface-3)", display: "grid", placeItems: "center", color: audioFileName ? "var(--brand)" : "var(--text-muted)" }}>
                  {audioFileName ? <MusicNoteIcon width={20} height={20} /> : <UploadCloudIcon width={20} height={20} />}
                </div>
                {audioFileName ? (
                  <>
                    <span className="text-small" style={{ fontWeight: "var(--fw-semibold)", color: "var(--text-primary)", maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {audioFileName}
                    </span>
                    <span className="text-small" style={{ color: "var(--brand)", fontSize: "0.7rem" }}>Replace music file</span>
                  </>
                ) : (
                  <>
                    <span className="text-small" style={{ fontWeight: "var(--fw-medium)", fontSize: "0.82rem" }}>Upload Music File</span>
                    <span className="hint" style={{ fontSize: "0.68rem" }}>MP3, WAV, FLAC only</span>
                  </>
                )}
              </div>
            </div>

            {/* Music Logo */}
            <div className="field">
              <label className="label">Music Logo / Art</label>
              <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoSelect} />
              <div
                onClick={() => logoInputRef.current?.click()}
                style={{
                  border: musicLogo ? "1px solid var(--brand)" : "1px dashed var(--border-default)",
                  borderRadius: "var(--radius-md)", padding: "var(--space-3)", textAlign: "center",
                  cursor: "pointer", background: "var(--bg-surface-2)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  minHeight: 110, gap: "6px", transition: "border-color 0.15s ease",
                }}
              >
                {musicLogo ? (
                  <>
                    <img src={musicLogo} alt="Music logo" style={{ width: 48, height: 48, borderRadius: "var(--radius-xs)", objectFit: "cover", boxShadow: "var(--shadow-sm)" }} />
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span className="text-small" style={{ color: "var(--brand)", fontSize: "0.7rem" }}>Change</span>
                      <span className="text-small text-muted" style={{ fontSize: "0.7rem" }} onClick={(e) => { e.stopPropagation(); setRawImage(musicLogo); setEditorOpen(true); }}>Adjust</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--bg-surface-3)", display: "grid", placeItems: "center", color: "var(--text-muted)" }}>
                      <CameraIcon width={18} height={18} />
                    </div>
                    <span className="text-small" style={{ fontWeight: "var(--fw-medium)", fontSize: "0.82rem" }}>Upload Logo</span>
                    <span className="hint" style={{ fontSize: "0.68rem" }}>Square artwork</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Song Name */}
          <div className="field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="label" htmlFor="song-name">Song Name</label>
              <span className="hint">{songName.length}/40</span>
            </div>
            <input id="song-name" className="input" type="text" maxLength={40} placeholder="e.g. Midnight Reverie" value={songName} onChange={(e) => setSongName(e.target.value)} required autoFocus />
          </div>

          {/* Artist Search + Uploaded By row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>

            {/* Artist Search Dropdown */}
            <div className="field" ref={artistDropdownRef} style={{ position: "relative" }}>
              <label className="label">Artist</label>
              <div
                onClick={() => setIsArtistDropdownOpen((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 10px",
                  borderRadius: "var(--radius-md)", cursor: "pointer", userSelect: "none",
                  border: isArtistDropdownOpen ? "1px solid var(--brand)" : "1px solid var(--border-default)",
                  background: "var(--bg-surface-2)",
                }}
              >
                {selectedArtist ? (
                  <>
                    {selectedArtist.imageUrl && (
                      <img src={selectedArtist.imageUrl} alt={selectedArtist.name} style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    )}
                    <span style={{ flex: 1, fontSize: "var(--fs-sm)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {selectedArtist.name}
                    </span>
                    <span
                      onClick={(e) => { e.stopPropagation(); setSelectedArtist(null); setArtistSearch(""); }}
                      style={{ color: "var(--text-muted)", fontSize: "1.1rem", lineHeight: 1, cursor: "pointer", padding: "0 2px" }}
                      aria-label="Clear artist"
                    >×</span>
                  </>
                ) : (
                  <>
                    <SearchIcon width={14} height={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>Search artist...</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </>
                )}
              </div>

              {/* Dropdown panel */}
              {isArtistDropdownOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
                  background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", overflow: "hidden",
                }}>
                  {/* Search inside dropdown */}
                  <div style={{ padding: "8px", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                        <SearchIcon width={13} height={13} />
                      </span>
                      <input
                        className="input"
                        type="text"
                        placeholder="Type to search artists..."
                        value={artistSearch}
                        onChange={(e) => setArtistSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ paddingLeft: 26, height: 32, fontSize: "var(--fs-xs)" }}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Artist list */}
                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    {isFetchingArtists ? (
                      <div style={{ padding: "12px 14px", fontSize: "var(--fs-xs)", color: "var(--text-muted)", textAlign: "center" }}>
                        Loading artists...
                      </div>
                    ) : filteredArtists.length === 0 ? (
                      <div style={{ padding: "12px 14px", fontSize: "var(--fs-xs)", color: "var(--text-muted)", textAlign: "center" }}>
                        {artistSearch ? `No artist found for "${artistSearch}"` : "No artists yet. Add an artist first."}
                      </div>
                    ) : (
                      filteredArtists.map((artist) => (
                        <div
                          key={artist.id}
                          onClick={() => { setSelectedArtist(artist); setArtistSearch(""); setIsArtistDropdownOpen(false); }}
                          style={{
                            display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px",
                            cursor: "pointer", transition: "background 0.1s",
                            background: selectedArtist?.id === artist.id ? "var(--bg-surface-2)" : "transparent",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = selectedArtist?.id === artist.id ? "var(--bg-surface-2)" : "transparent")}
                        >
                          {artist.imageUrl ? (
                            <img src={artist.imageUrl} alt={artist.name} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-surface-3)", flexShrink: 0, display: "grid", placeItems: "center", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "bold" }}>
                              {artist.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-primary)" }}>{artist.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded By */}
            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="label" htmlFor="uploaded-by" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Uploaded By
                  {currentUser && (
                    <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: "var(--radius-pill)", background: "rgba(227, 245, 96, 0.15)", color: "var(--brand)", fontWeight: "bold" }}>
                      Auth User
                    </span>
                  )}
                </label>
                <span className="hint">{uploadedByName.length}/30</span>
              </div>
              <input
                id="uploaded-by"
                className="input"
                type="text"
                maxLength={30}
                placeholder={currentUser?.name || currentUser?.username || "e.g. Sahil"}
                value={uploadedByName}
                onChange={(e) => setUploadedByName(e.target.value)}
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div style={{ padding: "10px 14px", background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "4px" }}>
            <input
              id="upload-agree-terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ accentColor: "var(--brand)", width: "16px", height: "16px", marginTop: "2px", cursor: "pointer", flexShrink: 0 }}
            />
            <label htmlFor="upload-agree-terms" style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.45", cursor: "pointer" }}>
              I agree to the{" "}
              <Link href="/terms" target="_blank" style={{ color: "var(--brand)", fontWeight: "var(--fw-semibold)", textDecoration: "underline", fontSize: "12px" }}>
                Terms of Service
              </Link>{" "}
              &amp; Copyright Policy, and confirm I have the rights to upload and share this content.
            </label>
          </div>

        </form>
      </Modal>

      {/* Image crop editor */}
      {editorOpen && (
        <ImageEditorModal
          open={editorOpen}
          imageSrc={rawImage}
          type="logo"
          onClose={() => setEditorOpen(false)}
          onSave={(croppedUrl) => setMusicLogo(croppedUrl)}
        />
      )}
    </>
  );
}
