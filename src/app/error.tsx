"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="standalone">
      <EmptyState
        title="Something went wrong"
        description="We couldn't load this page. Try again in a moment."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </div>
  );
}
