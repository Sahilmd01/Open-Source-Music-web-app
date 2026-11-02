"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/user";
import { UserCard } from "./user-card";
import { SearchIcon } from "@/components/icons";
import { useUiStore } from "@/stores/ui-store";
import { useToast } from "@/providers/toast-provider";
import { UsersGridSkeleton, UserCardSkeleton } from "@/components/skeletons";

const PAGE_SIZE = 10;

export function UsersDirectory() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");

  const currentUser = useUiStore((s) => s.user);
  const isAuthenticated = useUiStore((s) => s.isAuthenticated);
  const { toast } = useToast();

  const [adminSimulation, setAdminSimulation] = useState(false);
  const isAdmin = (isAuthenticated && currentUser?.role === "admin") || adminSimulation;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Initial load or search query change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const queryParams = new URLSearchParams({
          limit: PAGE_SIZE.toString(),
          offset: "0",
        });
        if (search.trim()) {
          queryParams.set("search", search.trim());
        }

        const res = await fetch(`/api/users?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setUsers(data.users || []);
            setTotalCount(data.pagination?.total || data.users?.length || 0);
            setHasMore(Boolean(data.pagination?.hasMore));
          }
        }
      } catch (err) {
        console.error("Failed to load initial users:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, search ? 300 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search]);

  // Infinite scroll: fetch next 10 users when bottom sentinel enters viewport
  const loadMoreUsers = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;

    setIsLoadingMore(true);
    try {
      const currentOffset = users.length;
      const queryParams = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: currentOffset.toString(),
      });
      if (search.trim()) {
        queryParams.set("search", search.trim());
      }

      const res = await fetch(`/api/users?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.users) {
          setUsers((prev) => {
            // deduplicate by id just in case
            const existingIds = new Set(prev.map((u) => u.id));
            const newUsers = data.users.filter((u: User) => !existingIds.has(u.id));
            return [...prev, ...newUsers];
          });
          setHasMore(Boolean(data.pagination?.hasMore));
          setTotalCount(data.pagination?.total || 0);
        }
      }
    } catch (err) {
      console.error("Failed to load more users:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, isLoading, users.length, search]);

  // IntersectionObserver attached to the bottom sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreUsers();
        }
      },
      {
        rootMargin: "250px", // Trigger slightly before hitting the absolute bottom for seamless loading
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadMoreUsers]);

  const handleOpenDetails = (user: User) => {
    router.push(`/users/${encodeURIComponent(user.id)}`);
  };

  const handleToggleBan = (userId: string, shouldBan: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBanned: shouldBan } : u))
    );

    const targetUser = users.find((u) => u.id === userId);
    toast({
      kind: shouldBan ? "error" : "success",
      title: shouldBan ? "User Suspended" : "User Reinstated",
      description: shouldBan
        ? `@${targetUser?.username || "User"} has been suspended.`
        : `@${targetUser?.username || "User"} has been activated.`,
    });
  };

  const handleSendWarning = (userId: string, warningText: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const currentWarnings = u.warnings || [];
          return { ...u, warnings: [...currentWarnings, warningText] };
        }
        return u;
      })
    );

    toast({
      kind: "warning",
      title: "Warning Dispatched",
      description: "Official advisory has been logged for this account.",
    });
  };

  return (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      {/* Directory Header Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)" }}>
              Community Members
            </h1>
            <span
              style={{
                fontSize: "var(--fs-xs)",
                fontWeight: "var(--fw-bold)",
                padding: "3px 10px",
                borderRadius: "var(--radius-pill)",
                background: "var(--bg-surface-2)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
              }}
            >
              {totalCount} {totalCount === 1 ? "Member" : "Members"}
            </span>
            {isAdmin && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "var(--fw-bold)",
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--yellow-500)",
                  color: "#000",
                }}
              >
                Admin Mode Active
              </span>
            )}
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>
            Explore actual registered listeners, artists, and creators in Listenify.
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          {currentUser?.role === "admin" && (
            <button
              type="button"
              onClick={() => setAdminSimulation(!adminSimulation)}
              style={{
                fontSize: "11px",
                padding: "5px 12px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-subtle)",
                background: adminSimulation ? "rgba(245, 158, 11, 0.15)" : "var(--bg-muted)",
                color: adminSimulation ? "#f59e0b" : "var(--text-muted)",
                cursor: "pointer",
                fontWeight: "var(--fw-medium)",
                letterSpacing: "0.02em",
              }}
              title="Toggle admin perspective"
            >
              {adminSimulation ? "Admin View: Enabled" : "User View: Enabled"}
            </button>
          )}

          {/* Search box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              background: "var(--bg-muted)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-pill)",
              padding: "6px 14px",
              minWidth: 260,
            }}
          >
            <SearchIcon width={16} height={16} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by name, username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "var(--fs-sm)",
                width: "100%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Initial Loading Skeleton */}
      {isLoading ? (
        <UsersGridSkeleton count={8} />
      ) : users.length === 0 ? (
        <div
          style={{
            padding: "var(--space-12)",
            textAlign: "center",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px dashed var(--border-subtle)",
            color: "var(--text-muted)",
          }}
        >
          <p style={{ fontSize: "var(--fs-base)", margin: 0 }}>
            {search ? `No members matched "${search}"` : "No registered members found yet."}
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
              gap: "var(--space-5)",
            }}
          >
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isAdmin={isAdmin}
                onViewDetails={handleOpenDetails}
                onToggleBan={handleToggleBan}
                onSendWarning={handleSendWarning}
              />
            ))}
          </div>

          {/* Bottom Sentinel for Infinite Scroll */}
          <div ref={sentinelRef} style={{ height: 20, width: "100%" }} />

          {/* Subsequent 10-item Loading Skeleton when scrolling */}
          {isLoadingMore && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
                gap: "var(--space-5)",
                marginTop: "var(--space-3)",
              }}
            >
              {Array.from({ length: 4 }, (_, i) => (
                <UserCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          )}

          {/* End of results indicator */}
          {!hasMore && users.length > 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-4) 0",
                fontSize: "var(--fs-xs)",
                color: "var(--text-muted)",
              }}
            >
              You&apos;ve reached the end of the directory.
            </div>
          )}
        </>
      )}
    </div>
  );
}
