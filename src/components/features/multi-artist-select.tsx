"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SearchIcon } from "@/components/icons";

export interface ArtistOption {
  id: string;
  name: string;
  imageUrl?: string;
}

interface MultiArtistSelectProps {
  selectedArtists: ArtistOption[];
  onChange: (artists: ArtistOption[]) => void;
  maxArtists?: number;
}

export function MultiArtistSelect({
  selectedArtists,
  onChange,
  maxArtists = 5,
}: MultiArtistSelectProps) {
  const [artistSearch, setArtistSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [artistOptions, setArtistOptions] = useState<ArtistOption[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchArtists = useCallback(async (search: string) => {
    setIsFetching(true);
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
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => fetchArtists(artistSearch), 250);
    return () => clearTimeout(timer);
  }, [artistSearch, isOpen, fetchArtists]);

  useEffect(() => {
    if (isOpen) {
      fetchArtists(artistSearch);
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleToggleArtist = (opt: ArtistOption) => {
    const exists = selectedArtists.some(
      (a) => a.id === opt.id || a.name.toLowerCase() === opt.name.toLowerCase()
    );
    if (exists) {
      onChange(selectedArtists.filter((a) => a.id !== opt.id && a.name.toLowerCase() !== opt.name.toLowerCase()));
    } else {
      if (selectedArtists.length >= maxArtists) return;
      onChange([...selectedArtists, opt]);
    }
  };

  const handleRemoveArtist = (optId: string) => {
    onChange(selectedArtists.filter((a) => a.id !== optId));
  };

  const handleAddCustomArtist = () => {
    const customName = artistSearch.trim();
    if (!customName) return;
    if (selectedArtists.length >= maxArtists) return;

    if (!selectedArtists.some((a) => a.name.toLowerCase() === customName.toLowerCase())) {
      onChange([...selectedArtists, { id: `art-${Date.now()}`, name: customName }]);
    }
    setArtistSearch("");
  };

  const filteredArtists = artistOptions.filter((a) =>
    a.name.toLowerCase().includes(artistSearch.toLowerCase().trim())
  );

  const isAtLimit = selectedArtists.length >= maxArtists;

  return (
    <div className="field" ref={dropdownRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label className="label">Artists</label>
        <span
          className="hint"
          style={{
            color: isAtLimit ? "var(--warning, #eab308)" : selectedArtists.length > 0 ? "var(--brand)" : "var(--text-muted)",
            fontSize: "0.75rem",
          }}
        >
          {selectedArtists.length}/{maxArtists} artists
        </span>
      </div>

      <div
        onClick={() => setIsOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "6px",
          minHeight: "38px",
          padding: "4px 8px",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          userSelect: "none",
          border: isOpen ? "1px solid var(--brand)" : "1px solid var(--border-default)",
          background: "var(--bg-surface-2)",
        }}
      >
        {selectedArtists.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", flex: 1 }}>
            {selectedArtists.map((artist) => (
              <span
                key={artist.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "var(--bg-surface-3)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-pill)",
                  padding: "2px 8px 2px 4px",
                  fontSize: "var(--fs-xs)",
                  color: "var(--text-primary)",
                  fontWeight: "var(--fw-medium)",
                }}
              >
                {artist.imageUrl ? (
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    style={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "var(--brand)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "9px",
                      lineHeight: 1,
                    }}
                  >
                    {artist.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span>{artist.name}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveArtist(artist.id);
                  }}
                  style={{
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                    lineHeight: 1,
                    paddingLeft: "2px",
                  }}
                  aria-label={`Remove ${artist.name}`}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
        ) : (
          <>
            <SearchIcon width={14} height={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>
              Select up to {maxArtists} artists...
            </span>
          </>
        )}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--text-muted)", flexShrink: 0, marginLeft: "auto" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
          }}
        >
          {/* Search inside dropdown */}
          <div style={{ padding: "8px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                <SearchIcon width={13} height={13} />
              </span>
              <input
                className="input"
                type="text"
                placeholder={isAtLimit ? `Max ${maxArtists} artists reached` : "Type to search artists..."}
                value={artistSearch}
                disabled={isAtLimit}
                onChange={(e) => setArtistSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{ paddingLeft: 26, height: 32, fontSize: "var(--fs-xs)" }}
                autoFocus
              />
            </div>
          </div>

          {/* Artist list */}
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {isFetching ? (
              <div style={{ padding: "12px 14px", fontSize: "var(--fs-xs)", color: "var(--text-muted)", textAlign: "center" }}>
                Loading artists...
              </div>
            ) : (
              <>
                {filteredArtists.length === 0 && artistSearch.trim() && !isAtLimit && (
                  <div style={{ padding: "10px 12px", textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddCustomArtist();
                      }}
                      style={{
                        background: "var(--brand)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        padding: "5px 10px",
                        fontSize: "var(--fs-xs)",
                        cursor: "pointer",
                      }}
                    >
                      Add &ldquo;{artistSearch.trim()}&rdquo; as artist
                    </button>
                  </div>
                )}
                {filteredArtists.length === 0 && !artistSearch.trim() && (
                  <div style={{ padding: "12px 14px", fontSize: "var(--fs-xs)", color: "var(--text-muted)", textAlign: "center" }}>
                    No artists available.
                  </div>
                )}
                {filteredArtists.map((opt) => {
                  const isSelected = selectedArtists.some((a) => a.id === opt.id);
                  const disabled = !isSelected && isAtLimit;

                  return (
                    <div
                      key={opt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (disabled) return;
                        handleToggleArtist(opt);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.45 : 1,
                        transition: "background 0.1s",
                        background: isSelected ? "var(--bg-surface-2)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!disabled) e.currentTarget.style.background = "var(--bg-surface-2)";
                      }}
                      onMouseLeave={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.background = isSelected ? "var(--bg-surface-2)" : "transparent";
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={disabled}
                        readOnly
                        style={{ accentColor: "var(--brand)", cursor: disabled ? "not-allowed" : "pointer" }}
                      />
                      {opt.imageUrl ? (
                        <img
                          src={opt.imageUrl}
                          alt={opt.name}
                          style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: "var(--bg-surface-3)",
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            fontWeight: "bold",
                          }}
                        >
                          {opt.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span
                        style={{
                          fontSize: "var(--fs-sm)",
                          color: "var(--text-primary)",
                          fontWeight: isSelected ? "var(--fw-semibold)" : "var(--fw-normal)",
                        }}
                      >
                        {opt.name}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
