import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="standalone">
      <EmptyState
        title="Page not found"
        description="That page doesn't exist or has moved."
        action={<Link href="/" className="btn btn--primary">Back to Browse</Link>}
      />
    </div>
  );
}
