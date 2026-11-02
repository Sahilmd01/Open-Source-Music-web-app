import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ListenifyLogo } from "@/components/icons";

export const metadata: Metadata = {
  title: "About Us — Our Mission & Platform",
  description:
    "Learn about Listenify, our mission to support independent musicians, creators, and listeners with modern audio streaming.",
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 840, margin: "0 auto", padding: "var(--space-6) var(--space-4) var(--space-12)" }}>
      {/* Top Header Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "var(--fs-sm)",
            fontWeight: "var(--fw-medium)",
            padding: "8px 14px",
            borderRadius: "var(--radius-pill)",
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-subtle)",
            transition: "all var(--dur-fast)",
          }}
        >
          <ArrowLeftIcon width={16} height={16} />
          <span>Back to Listenify</span>
        </Link>

        <Link
          href="/terms"
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            textDecoration: "none",
            padding: "6px 12px",
            borderRadius: "var(--radius-pill)",
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          Terms &amp; Policies
        </Link>
      </div>

      {/* Main Flat Document (No 3D effects, clean typography) */}
      <article
        style={{
          background: "transparent",
          padding: "var(--space-2) 0",
          boxShadow: "none",
          lineHeight: "1.75",
          color: "var(--text-secondary)",
          fontSize: "14.5px",
        }}
      >
        {/* Brand Hero */}
        <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "var(--space-8)", marginBottom: "var(--space-8)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "var(--space-3)" }}>
            <ListenifyLogo width={36} height={36} />
            <span
              style={{
                background: "rgba(227, 245, 96, 0.12)",
                color: "var(--brand)",
                padding: "3px 10px",
                borderRadius: "var(--radius-pill)",
                fontSize: "11px",
                fontWeight: "var(--fw-bold)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              About Listenify
            </span>
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: "var(--fw-bold)", color: "var(--text-primary)", margin: "4px 0 10px" }}>
            Sound, Streamlined.
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "16px", maxWidth: 640 }}>
            Listenify is a modern music discovery and audio streaming platform built for independent artists, curators, and listeners worldwide.
          </p>
        </div>

        {/* 1. Our Mission */}
        <section style={{ marginBottom: "var(--space-10)" }}>
          <h2 style={{ fontSize: "22px", color: "var(--text-primary)", margin: "0 0 12px" }}>
            1. Our Mission
          </h2>
          <p>
            Music should be accessible, immersive, and respectful of the artists who make it. Listenify was founded with a singular purpose: to provide musicians a direct, transparent stage to share their original sound and give listeners an intuitive, high-fidelity experience without corporate clutter or invasive tracking.
          </p>
          <p>
            Whether discovering underground electronic producers, lo-fi beatmakers, ambient soundscapes, or managing personal local audio files, Listenify puts the music front and center.
          </p>
        </section>

        {/* 2. Platform Core Pillars */}
        <section style={{ marginBottom: "var(--space-10)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-8)" }}>
          <h2 style={{ fontSize: "22px", color: "var(--text-primary)", margin: "0 0 16px" }}>
            2. What Sets Us Apart
          </h2>

          <div style={{ display: "grid", gap: "16px" }}>
            <div
              style={{
                padding: "16px 18px",
                background: "var(--bg-surface-2)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "16px", color: "var(--text-primary)", margin: "0 0 6px" }}>
                Creator-First Ownership
              </h3>
              <p style={{ margin: 0, fontSize: "13.5px" }}>
                Artists retain 100% ownership of their music. We provide clear licensing boundaries, active copyright protection mechanisms, and straightforward upload verification.
              </p>
            </div>

            <div
              style={{
                padding: "16px 18px",
                background: "var(--bg-surface-2)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "16px", color: "var(--text-primary)", margin: "0 0 6px" }}>
                Lightning-Fast Streaming &amp; Local Files
              </h3>
              <p style={{ margin: 0, fontSize: "13.5px" }}>
                Stream seamlessly in the browser or play your own personal lossless audio files (.mp3, .wav, .flac) directly inside your local files library with instant playback.
              </p>
            </div>

            <div
              style={{
                padding: "16px 18px",
                background: "var(--bg-surface-2)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "16px", color: "var(--text-primary)", margin: "0 0 6px" }}>
                Clean, Focused Listening
              </h3>
              <p style={{ margin: 0, fontSize: "13.5px" }}>
                No intrusive third-party ads, no bloatware, and no artificial volume limits. Beautiful minimalist design tailored for audiophiles and casual listeners alike.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Community & Copyright Integrity */}
        <section style={{ marginBottom: "var(--space-10)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-8)" }}>
          <h2 style={{ fontSize: "22px", color: "var(--text-primary)", margin: "0 0 12px" }}>
            3. Copyright &amp; Artist Respect
          </h2>
          <p>
            We take intellectual property seriously. Listenify maintains a zero-tolerance policy for unauthorized commercial uploads, ripped tracks, or infringing distribution. Every user upload is accompanied by a legally binding declaration of rights, and our platform includes dedicated in-app reporting tools for rights holders to submit and resolve claims quickly.
          </p>
          <p>
            You can review our full legal commitments, statutory processes, and data security standards in our{" "}
            <Link href="/terms" style={{ color: "var(--brand)", textDecoration: "underline" }}>
              Terms of Service &amp; Policies
            </Link>.
          </p>
        </section>

        {/* 4. Contact & Support */}
        <section style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-8)" }}>
          <h2 style={{ fontSize: "22px", color: "var(--text-primary)", margin: "0 0 12px" }}>
            4. Connect With Us
          </h2>
          <p>
            Have feedback, questions about artist verification, or need assistance? Reach out to our dedicated teams:
          </p>

          <ul style={{ paddingLeft: "24px", margin: "8px 0" }}>
            <li><strong>General Inquiries &amp; Support:</strong> support@listenify.com</li>
            <li><strong>Copyright &amp; IP Protection:</strong> copyright@listenify.com</li>
            <li><strong>Privacy &amp; Data Security:</strong> privacy@listenify.com</li>
            <li><strong>Artist Partnerships:</strong> artists@listenify.com</li>
          </ul>
        </section>
      </article>
    </div>
  );
}
