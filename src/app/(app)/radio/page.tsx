"use client";

import { useEffect, useState } from "react";
import { MediaCard } from "@/components/features/media-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

interface Station {
  id: string;
  name: string;
  description: string;
  hue: number;
}

export default function RadioPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStations() {
      try {
        const res = await fetch("/api/control/artists");
        const data = await res.json();
        if (data.success && Array.isArray(data.artists) && data.artists.length > 0) {
          const generated: Station[] = data.artists.map((a: any, i: number) => ({
            id: String(a.id),
            name: `${a.name} Radio`,
            description: `Nonstop mix inspired by ${a.name} and similar artists.`,
            hue: ((i * 47) % 360) + 1,
          }));
          if (isMounted) {
            setStations(generated);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch artists for radio:", err);
      }
      if (isMounted) {
        setStations([]);
        setLoading(false);
      }
    }

    loadStations();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader title="Radio" description="Endless stations based on your artists" />
      {loading ? null : stations.length === 0 ? (
        <EmptyState
          title="No radio stations available"
          description="Stations will appear here once artists and tracks are added to the library."
        />
      ) : (
        <div className="media-grid">
          {stations.map((s) => (
            <MediaCard key={s.id} title={s.name} subtitle={s.description} hue={s.hue} />
          ))}
        </div>
      )}
    </>
  );
}
