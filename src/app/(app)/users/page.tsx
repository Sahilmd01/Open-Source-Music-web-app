import type { Metadata } from "next";
import { UsersDirectory } from "@/components/users";

export const metadata: Metadata = {
  title: "All Users — Listenify",
  description: "Browse all members, artists, and administrators in Listenify.",
};

export default function UsersPage() {
  return (
    <div className="page-container" style={{ paddingBottom: "var(--space-12)" }}>
      <UsersDirectory />
    </div>
  );
}
