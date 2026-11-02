"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/providers/toast-provider";

const VARIANTS: ButtonVariant[] = [
  "primary", "accent", "secondary", "ghost", "link",
  "success", "danger", "warning", "danger-outline", "success-outline",
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h2 className="h3 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export function DesignSystemDemo() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [chip, setChip] = useState("All");
  const [loading, setLoading] = useState(false);

  const simulateSave = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      toast({ kind: "success", title: "Saved", description: "Your playlist was updated." });
    }, 1200);
  };

  return (
    <>
      <Block title="Buttons">
        <div className="btn-group">
          {VARIANTS.map((v) => (
            <Button key={v} variant={v}>{v}</Button>
          ))}
        </div>
        <div className="btn-group mt-4">
          <Button size="sm">Small</Button>
          <Button>Medium</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button variant="accent" loading={loading} onClick={simulateSave}>Save changes</Button>
        </div>
      </Block>

      <Block title="Alerts">
        <div className="grid gap-3">
          <Alert kind="success" title="Added to Favorites">&quot;Snowfall&quot; is now in your library.</Alert>
          <Alert kind="error" title="Playback failed">Check your connection and try again.</Alert>
          <Alert kind="warning" title="Offline">Downloads are paused until you reconnect.</Alert>
          <Alert kind="info" title="New release">A new album from an artist you follow is out now.</Alert>
        </div>
      </Block>

      <Block title="Toasts">
        <div className="btn-group">
          <Button variant="success" onClick={() => toast({ kind: "success", title: "Playlist created" })}>Success</Button>
          <Button variant="danger" onClick={() => toast({ kind: "error", title: "Couldn't delete playlist", description: "Try again." })}>Error</Button>
          <Button variant="warning" onClick={() => toast({ kind: "warning", title: "Low storage" })}>Warning</Button>
          <Button variant="secondary" onClick={() => toast({ kind: "info", title: "Queue updated" })}>Info</Button>
        </div>
      </Block>

      <Block title="Form fields">
        <div className="form-grid">
          <Field label="Playlist name" placeholder="Morning run" />
          <Field label="Email" type="email" defaultValue="alex@example.com" status="success" hint="Looks good." />
          <Field label="Password" type="password" defaultValue="123" status="error" hint="Use at least 8 characters." />
        </div>
        <div className="btn-group mt-4">
          <Switch label="Crossfade" defaultChecked />
          <Switch label="Explicit content" />
        </div>
      </Block>

      <Block title="Badges and chips">
        <div className="btn-group mb-4">
          <Badge>Neutral</Badge><Badge tone="brand">Brand</Badge><Badge tone="accent">New</Badge>
          <Badge tone="success">Live</Badge><Badge tone="error">Failed</Badge>
          <Badge tone="warning">Pending</Badge><Badge tone="info">Beta</Badge>
        </div>
        <div className="btn-group">
          {["All", "Pop", "Hip hop", "Indie"].map((c) => (
            <Chip key={c} active={chip === c} onClick={() => setChip(c)}>{c}</Chip>
          ))}
        </div>
      </Block>

      <Block title="Modal and loading">
        <div className="btn-group mb-4">
          <Button variant="danger-outline" onClick={() => setModalOpen(true)}>Delete playlist</Button>
        </div>
        <div className="grid gap-3">
          <Skeleton style={{ height: 48 }} />
          <Skeleton style={{ height: 48, width: "70%" }} />
        </div>
      </Block>

      <Modal
        open={modalOpen}
        title="Delete this playlist?"
        onClose={() => setModalOpen(false)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                setModalOpen(false);
                toast({ kind: "error", title: "Playlist deleted" });
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>This removes the playlist from your library. You can&apos;t undo this.</p>
      </Modal>
    </>
  );
}
