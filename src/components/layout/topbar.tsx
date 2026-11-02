"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { BellIcon, ChevronRightIcon, MenuIcon, SearchIcon, SettingsIcon, CloseIcon, ListenifyLogo, PlayIcon, SpinnerIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { CoverArt } from "@/components/ui/cover-art";
import { ThemeToggle } from "./theme-toggle";
import { PAGE_TITLES, TOP_TABS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/ui-store";
import { usePlayerStore } from "@/stores/player-store";
import { LoginModal, SignupModal, ForgotPasswordModal } from "@/components/auth";
import type { Track } from "@/types/music";

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playContextTrack = usePlayerStore((s) => s.playContextTrack);

  const [searchVal, setSearchVal] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    songs: Track[];
    artists: any[];
    albums: any[];
    playlists: any[];
  }>({ songs: [], artists: [], albums: [], playlists: [] });
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Sync input value if on /search page
  useEffect(() => {
    if (pathname === "/search") {
      setSearchVal(searchParams.get("q") || "");
    }
  }, [pathname, searchParams]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedDesktop = searchContainerRef.current?.contains(target);
      const clickedMobile = mobileSearchContainerRef.current?.contains(target);
      if (!clickedDesktop && !clickedMobile) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Debounced live search preview
  useEffect(() => {
    if (!searchVal.trim() || searchVal.length < 2) {
      setSearchResults({ songs: [], artists: [], albums: [], playlists: [] });
      setDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchVal.trim())}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults({
            songs: data.songs || [],
            artists: data.artists || [],
            albums: data.albums || [],
            playlists: data.playlists || [],
          });
          setDropdownOpen(true);
        }
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchVal]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchVal.trim()) return;
    setDropdownOpen(false);
    setMobileSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
  };
  const openSidebar = useUiStore((s) => s.openSidebar);
  const isAuthenticated = useUiStore((s) => s.isAuthenticated);
  const user = useUiStore((s) => s.user);
  const logout = useUiStore((s) => s.logout);
  const loginModalOpen = useUiStore((s) => s.loginModalOpen);
  const signupModalOpen = useUiStore((s) => s.signupModalOpen);
  const forgotPasswordModalOpen = useUiStore((s) => s.forgotPasswordModalOpen);
  const openLoginModal = useUiStore((s) => s.openLoginModal);
  const closeLoginModal = useUiStore((s) => s.closeLoginModal);
  const openSignupModal = useUiStore((s) => s.openSignupModal);
  const closeSignupModal = useUiStore((s) => s.closeSignupModal);
  const openForgotPasswordModal = useUiStore((s) => s.openForgotPasswordModal);
  const closeForgotPasswordModal = useUiStore((s) => s.closeForgotPasswordModal);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const title = PAGE_TITLES[pathname] ?? "Browse";

  // Dynamic breadcrumb generation
  const getBreadcrumbs = () => {
    if (pathname === "/") {
      return [{ label: "Home", href: "/" }, { label: "Browse" }];
    }
    if (pathname === "/new") {
      return [{ label: "Discover", href: "/" }, { label: "New Releases" }];
    }
    if (pathname.startsWith("/songs")) {
      return [{ label: "Library", href: "/" }, { label: "Songs" }];
    }
    if (pathname.startsWith("/albums")) {
      return [{ label: "Library", href: "/albums" }, { label: pathname === "/albums" ? "Albums" : title }];
    }
    if (pathname.startsWith("/artists")) {
      return [{ label: "Library", href: "/artists" }, { label: pathname === "/artists" ? "Artists" : title }];
    }
    if (pathname.startsWith("/playlists")) {
      return [{ label: "Library", href: "/playlists" }, { label: pathname === "/playlists" ? "Playlists" : title }];
    }
    if (pathname.startsWith("/favorites")) {
      return [{ label: "My Music", href: "/" }, { label: "Favorites" }];
    }
    if (pathname.startsWith("/recently-played")) {
      return [{ label: "My Music", href: "/" }, { label: "Recently Played" }];
    }
    if (pathname.startsWith("/settings")) {
      return [{ label: "App", href: "/" }, { label: "Settings" }];
    }
    if (pathname.startsWith("/profile")) {
      return [{ label: "Account", href: "/" }, { label: "My Profile" }];
    }
    if (pathname.startsWith("/local-files")) {
      return [{ label: "My Music", href: "/" }, { label: "Local Files" }];
    }
    if (pathname.startsWith("/users")) {
      return [{ label: "Community", href: "/users" }, { label: pathname === "/users" ? "All Users" : "User Profile" }];
    }
    if (pathname.startsWith("/search")) {
      return [{ label: "Discover", href: "/" }, { label: "Search" }];
    }
    return [{ label: "Home", href: "/" }, { label: title }];
  };

  const renderDropdownContent = () => {
    const hasAnyResults =
      searchResults.songs.length > 0 ||
      searchResults.artists.length > 0 ||
      searchResults.albums.length > 0 ||
      searchResults.playlists.length > 0;

    if (!hasAnyResults) {
      return (
        <div className="search-dropdown__empty">
          No results for &ldquo;{searchVal}&rdquo;
        </div>
      );
    }

    return (
      <div className="search-dropdown__results">
        {/* Songs Quick List */}
        {searchResults.songs.length > 0 && (
          <div className="search-dropdown__section">
            <div className="search-dropdown__section-title">Songs</div>
            {searchResults.songs.slice(0, 4).map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  playContextTrack(s, searchResults.songs);
                  setDropdownOpen(false);
                  setMobileSearchOpen(false);
                }}
                className="search-dropdown__item search-dropdown__item--song"
              >
                <div className="search-dropdown__thumb">
                  <CoverArt src={s.coverImage} size={36} hue={s.hue || 24} />
                </div>
                <div className="search-dropdown__meta">
                  <div className="search-dropdown__title">{s.title}</div>
                  <div className="search-dropdown__subtitle">{s.artist}</div>
                </div>
                <PlayIcon width={14} height={14} className="search-dropdown__play-icon" />
              </div>
            ))}
          </div>
        )}

        {/* Artists Quick List */}
        {searchResults.artists.length > 0 && (
          <div className="search-dropdown__section">
            <div className="search-dropdown__section-title">Artists</div>
            {searchResults.artists.slice(0, 3).map((a) => (
              <Link
                key={a.id}
                href={`/artists/${encodeURIComponent(a.id)}`}
                onClick={() => {
                  setDropdownOpen(false);
                  setMobileSearchOpen(false);
                }}
                className="search-dropdown__item"
              >
                <div className="search-dropdown__thumb search-dropdown__thumb--round">
                  <CoverArt src={a.avatarUrl} rounded="full" size={32} hue={a.hue || 220} />
                </div>
                <div className="search-dropdown__meta">
                  <div className="search-dropdown__title">{a.name}</div>
                </div>
                <span className="search-dropdown__badge">Artist</span>
              </Link>
            ))}
          </div>
        )}

        {/* Albums Quick List */}
        {searchResults.albums.length > 0 && (
          <div className="search-dropdown__section">
            <div className="search-dropdown__section-title">Albums</div>
            {searchResults.albums.slice(0, 3).map((al) => (
              <Link
                key={al.id}
                href={`/albums/${encodeURIComponent(al.id)}`}
                onClick={() => {
                  setDropdownOpen(false);
                  setMobileSearchOpen(false);
                }}
                className="search-dropdown__item"
              >
                <div className="search-dropdown__thumb">
                  <CoverArt src={al.coverUrl} size={32} hue={al.hue || 200} />
                </div>
                <div className="search-dropdown__meta">
                  <div className="search-dropdown__title">{al.title}</div>
                  <div className="search-dropdown__subtitle">{al.artist}</div>
                </div>
                <span className="search-dropdown__badge">Album</span>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom View All Link */}
        <div className="search-dropdown__footer">
          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            className="search-dropdown__view-all"
          >
            View all results for &ldquo;{searchVal}&rdquo; &rarr;
          </button>
        </div>
      </div>
    );
  };

  const crumbs = getBreadcrumbs();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <IconButton label="Open menu" className="topbar__menu" onClick={openSidebar}>
          <MenuIcon />
        </IconButton>

        <Link href="/" className="topbar__brand-link" title="Listenify Home">
          <ListenifyLogo width={26} height={26} />
          <span className="topbar__brand-title">Listenify</span>
        </Link>
      </div>

      <nav className="breadcrumb topbar__crumbs" aria-label="Breadcrumb">
        <Link href={crumbs[0]!.href || "/"}>{crumbs[0]!.label}</Link>
        <ChevronRightIcon width={16} height={16} />
        <span className="breadcrumb__current" aria-current="page">{crumbs[1]!.label}</span>
      </nav>

      <div className="topbar__center" suppressHydrationWarning>
        {/* Permanent Search Input for Desktop */}
        <div ref={searchContainerRef} className="topbar__search-wrapper">
          <form onSubmit={handleSearchSubmit} className="search topbar__search--desktop" suppressHydrationWarning>
            <SearchIcon width={18} height={18} />
            <input
              className="input topbar__search-input"
              type="search"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onFocus={() => {
                if (searchResults.songs.length > 0 || searchResults.artists.length > 0 || searchResults.albums.length > 0 || searchResults.playlists.length > 0) {
                  setDropdownOpen(true);
                }
              }}
              placeholder="Search songs, artists, albums…"
              aria-label="Search"
            />
            {isSearching && (
              <div className="topbar__search-spinner">
                <SpinnerIcon width={14} height={14} style={{ color: "var(--brand)" }} />
              </div>
            )}
          </form>

          {/* Desktop Live Search Quick Preview Dropdown (hidden when mobile search is open) */}
          {dropdownOpen && !mobileSearchOpen && (
            <div className="search-dropdown-menu">
              {renderDropdownContent()}
            </div>
          )}
        </div>
      </div>

      <div className="topbar__actions" suppressHydrationWarning>
        {/* Mobile Search Toggle Icon */}
        <div className="topbar__search-toggle--mobile" suppressHydrationWarning>
          <IconButton
            label={mobileSearchOpen ? "Close search" : "Search"}
            onClick={() => {
              const nextState = !mobileSearchOpen;
              setMobileSearchOpen(nextState);
              if (nextState && (searchResults.songs.length > 0 || searchResults.artists.length > 0 || searchResults.albums.length > 0)) {
                setDropdownOpen(true);
              }
            }}
            className={mobileSearchOpen ? "is-active" : ""}
          >
            {mobileSearchOpen ? (
              <CloseIcon width={13} height={13} className="close-icon" />
            ) : (
              <SearchIcon width={20} height={20} className="search-icon" />
            )}
          </IconButton>
        </div>

        <ThemeToggle />

        {isAuthenticated ? (
          <>
            <Link href="/settings" style={{ textDecoration: "none", color: "inherit", display: "inline-flex" }}>
              <IconButton label="Settings"><SettingsIcon /></IconButton>
            </Link>
            <Link href="/notifications" style={{ textDecoration: "none", color: "inherit", display: "inline-flex" }}>
              <IconButton label="Notifications" style={{ position: "relative" }}>
                <BellIcon />
                <span className="notif-dot" />
              </IconButton>
            </Link>
            <Link href="/profile" style={{ textDecoration: "none", display: "inline-flex" }}>
              <div className="topbar__profile" title="View Profile" style={{ cursor: "pointer", width: 34, height: 34, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border-subtle)" }}>
                <img
                  src={user?.avatarUrl && user.avatarUrl.trim() !== "" ? user.avatarUrl : "/default/default-user-avatar.avif"}
                  alt={user?.name || "User profile"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            </Link>
          </>
        ) : (
          <div className="topbar__auth" suppressHydrationWarning>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={openLoginModal}
            >
              Log in
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={openSignupModal}
            >
              Sign up
            </button>
          </div>
        )}
      </div>

      {/* Mobile Search Bar Dropdown — appears directly below the navbar only in mobile */}
      {mobileSearchOpen && (
        <div ref={mobileSearchContainerRef} className="topbar__mobile-search-dropdown" suppressHydrationWarning>
          <form onSubmit={handleSearchSubmit} className="topbar__mobile-search-inner">
            <SearchIcon width={18} height={18} />
            <input
              className="input topbar__mobile-search-input"
              type="search"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onFocus={() => {
                if (searchResults.songs.length > 0 || searchResults.artists.length > 0 || searchResults.albums.length > 0 || searchResults.playlists.length > 0) {
                  setDropdownOpen(true);
                }
              }}
              placeholder="Search songs, artists, albums…"
              aria-label="Search"
              autoFocus
            />
            {isSearching ? (
              <SpinnerIcon width={14} height={14} style={{ color: "var(--brand)" }} />
            ) : null}
            <IconButton label="Close search" onClick={() => setMobileSearchOpen(false)} style={{ width: 30, height: 30 }}>
              <CloseIcon width={13} height={13} />
            </IconButton>
          </form>

          {/* Mobile Live Search Dropdown Card */}
          {dropdownOpen && (
            <div className="search-dropdown-menu search-dropdown-menu--mobile">
              {renderDropdownContent()}
            </div>
          )}
        </div>
      )}

      {/* Separate Login Popup Modal */}
      <LoginModal
        open={loginModalOpen}
        onClose={closeLoginModal}
        onSwitchToSignup={openSignupModal}
        onForgotPassword={openForgotPasswordModal}
      />

      {/* Separate Sign Up Popup Modal */}
      <SignupModal
        open={signupModalOpen}
        onClose={closeSignupModal}
        onSwitchToLogin={openLoginModal}
      />

      {/* Separate Forgot Password OTP & Reset Popup Modal */}
      <ForgotPasswordModal
        open={forgotPasswordModalOpen}
        onClose={closeForgotPasswordModal}
        onBackToLogin={openLoginModal}
      />
    </header>
  );
}
