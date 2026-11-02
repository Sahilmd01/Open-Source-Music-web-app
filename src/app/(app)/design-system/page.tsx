import type { Metadata } from "next";
import { DesignSystemDemo } from "@/components/features/design-system-demo";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Design system" };

export default function DesignSystemPage() {
  return (
    <>
      <PageHeader title="Design system" description="Every component in light and dark mode" />
      <DesignSystemDemo />
    </>
  );
}
