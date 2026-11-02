"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { Share2Icon } from "@/components/icons";

export function TermsServiceModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "copyright" | "guidelines">("terms");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/terms`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal
      open={open}
      title="Terms of Service & Platform Policies"
      onClose={onClose}
      maxWidth={560}
      actions={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href="/terms"
              target="_blank"
              onClick={onClose}
              style={{
                fontSize: "12px",
                color: "var(--brand)",
                textDecoration: "underline",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Open public page ↗
            </Link>
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "12px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Share2Icon width={13} height={13} />
              <span>{copied ? "Copied!" : "Copy link"}</span>
            </button>
          </div>
          <Button variant="primary" onClick={onClose}>
            I Understand & Agree
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", minHeight: 0 }}>
        {/* Policy navigation tabs */}
        <div className="modal-tabs-header">
          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            style={{
              padding: "7px 14px",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              fontWeight: "var(--fw-semibold)",
              border: "none",
              cursor: "pointer",
              background: activeTab === "terms" ? "var(--brand)" : "var(--bg-surface-2)",
              color: activeTab === "terms" ? "#000" : "var(--text-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: activeTab === "terms" ? "var(--shadow-sm)" : "none",
              transition: "background var(--dur-fast), color var(--dur-fast)",
            }}
          >
            Terms of Service
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("copyright")}
            style={{
              padding: "7px 14px",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              fontWeight: "var(--fw-semibold)",
              border: "none",
              cursor: "pointer",
              background: activeTab === "copyright" ? "var(--brand)" : "var(--bg-surface-2)",
              color: activeTab === "copyright" ? "#000" : "var(--text-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: activeTab === "copyright" ? "var(--shadow-sm)" : "none",
              transition: "background var(--dur-fast), color var(--dur-fast)",
            }}
          >
            Copyright Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            style={{
              padding: "7px 14px",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              fontWeight: "var(--fw-semibold)",
              border: "none",
              cursor: "pointer",
              background: activeTab === "privacy" ? "var(--brand)" : "var(--bg-surface-2)",
              color: activeTab === "privacy" ? "#000" : "var(--text-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: activeTab === "privacy" ? "var(--shadow-sm)" : "none",
              transition: "background var(--dur-fast), color var(--dur-fast)",
            }}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guidelines")}
            style={{
              padding: "7px 14px",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              fontWeight: "var(--fw-semibold)",
              border: "none",
              cursor: "pointer",
              background: activeTab === "guidelines" ? "var(--brand)" : "var(--bg-surface-2)",
              color: activeTab === "guidelines" ? "#000" : "var(--text-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: activeTab === "guidelines" ? "var(--shadow-sm)" : "none",
              transition: "background var(--dur-fast), color var(--dur-fast)",
            }}
          >
            Upload Guidelines
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div
          style={{
            overflowY: "auto",
            maxHeight: "52vh",
            paddingRight: "8px",
            fontSize: "13px",
            lineHeight: "1.6",
            color: "var(--text-secondary)",
            scrollbarWidth: "thin",
          }}
        >
          {activeTab === "terms" && (
            <div>
              <h3 style={{ fontSize: "16px", color: "var(--text-primary)", margin: "0 0 8px" }}>
                LISTENIFY — TERMS OF SERVICE
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>
                Platform operator: Listenify • Governing law: India
              </p>

              <h4 style={{ color: "var(--text-primary)", margin: "14px 0 6px" }}>1. Acceptance of Terms</h4>
              <p>
                Welcome to Listenify (&quot;Listenify&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). Listenify provides a platform through which users may upload, discover, share and listen to music, subject to the features available on the service.
                By creating an account or using Listenify, you agree to these Terms of Service, our Privacy Policy, Copyright Policy and applicable platform guidelines.
              </p>

              <h4 style={{ color: "var(--text-primary)", margin: "14px 0 6px" }}>2. Eligibility and Accounts</h4>
              <p>
                You must provide accurate account information and keep your login credentials secure. You are responsible for activities conducted through your account, subject to applicable law. Users under the age of 18 must use the service only where legally permitted and with any required parental or guardian authorization.
              </p>

              <h4 style={{ color: "var(--text-primary)", margin: "14px 0 6px" }}>3. Music Ownership and Upload Permissions</h4>
              <p>
                You retain ownership of music and other content you upload, subject to rights held by other parties. By uploading content, you represent that:
              </p>
              <ul style={{ paddingLeft: "20px", margin: "6px 0" }}>
                <li>You created the content or have obtained all permissions and licences necessary for the uses permitted on Listenify.</li>
                <li>Your upload does not knowingly infringe another person&apos;s copyright, privacy, publicity or other legal rights.</li>
                <li>You have permission to include any samples, beats, recordings, performances, lyrics, artwork or other third-party material.</li>
                <li>The information you provide about the content is accurate to the best of your knowledge.</li>
              </ul>
              <p>
                Purchasing, downloading or possessing an audio file does not by itself grant you permission to distribute or publicly stream it.
              </p>

              <h4 style={{ color: "var(--text-primary)", margin: "14px 0 6px" }}>4. Licence Granted to Listenify</h4>
              <p>
                You grant Listenify a non-exclusive licence to host, store, reproduce as technically necessary, transcode, transmit, display associated metadata and stream the content through the features you choose to use. We will not use your music in unrelated commercial releases or sell your music as our own.
              </p>

              <h4 style={{ color: "var(--text-primary)", margin: "14px 0 6px" }}>5. Prohibited Content</h4>
              <p>
                You must not upload or share copyrighted music without necessary authorization, unauthorized commercial recordings, movie soundtracks, rips, unauthorized remixes/mashups, malware, or deceptive files.
              </p>

              <h4 style={{ color: "var(--text-primary)", margin: "14px 0 6px" }}>6. Copyright Complaints and Content Removal</h4>
              <p>
                Listenify provides a process for reporting suspected copyright infringement. We may review complaints, request additional information, restrict access to content, remove content or suspend accounts when appropriate or legally required.
              </p>
            </div>
          )}

          {activeTab === "copyright" && (
            <div>
              <h3 style={{ fontSize: "16px", color: "var(--text-primary)", margin: "0 0 8px" }}>
                LISTENIFY — COPYRIGHT POLICY
              </h3>
              <p>
                Listenify respects the rights of musicians, composers, lyricists, producers, labels, performers and other copyright owners. Users must upload only content they own or are authorized to use.
              </p>
              <h4 style={{ color: "var(--text-primary)", margin: "14px 0 6px" }}>What Is Not Permitted</h4>
              <ul style={{ paddingLeft: "20px", margin: "6px 0" }}>
                <li>Commercial songs belonging to other artists or labels.</li>
                <li>Music extracted from films, music videos or streaming services.</li>
                <li>Unauthorized remixes, mashups, covers or samples.</li>
                <li>Recordings incorporating protected compositions or lyrics without necessary permissions.</li>
              </ul>
              <p>
                Crediting the artist, linking to the original song, or stating &quot;no copyright infringement intended&quot; does not grant permission.
              </p>
              <h4 style={{ color: "var(--text-primary)", margin: "14px 0 6px" }}>Reporting Infringement</h4>
              <p>
                Rights holders can report copyright infringement through the built-in 3-dot song menu (&quot;Report copyright infringement&quot;) or submit details including track URL, evidence of ownership, and contact information.
              </p>
            </div>
          )}

          {activeTab === "privacy" && (
            <div>
              <h3 style={{ fontSize: "16px", color: "var(--text-primary)", margin: "0 0 8px" }}>
                LISTENIFY — PRIVACY POLICY
              </h3>
              <p>
                Listenify respects your privacy. We collect account details, uploaded content metadata, and basic technical logs necessary to provide, protect, and improve music streaming and playback.
              </p>
              <h4 style={{ color: "var(--text-primary)", margin: "14px 0 6px" }}>Information We Process</h4>
              <ul style={{ paddingLeft: "20px", margin: "6px 0" }}>
                <li>Account profile (display name, avatar, preferences).</li>
                <li>Uploaded audio metadata, playlists, and favorites.</li>
                <li>Security and diagnostic data to safeguard user accounts.</li>
              </ul>
              <p>
                We do not sell personal data. Public tracks and artist profiles are visible to listeners across the platform.
              </p>
            </div>
          )}

          {activeTab === "guidelines" && (
            <div>
              <h3 style={{ fontSize: "16px", color: "var(--text-primary)", margin: "0 0 8px" }}>
                LISTENIFY — MUSIC UPLOAD GUIDELINES
              </h3>
              <h4 style={{ color: "var(--text-primary)", margin: "14px 0 6px" }}>Required Upload Declaration</h4>
              <blockquote
                style={{
                  margin: "8px 0",
                  padding: "10px 14px",
                  background: "var(--bg-surface-2)",
                  borderLeft: "3px solid var(--brand)",
                  borderRadius: "var(--radius-sm)",
                  fontStyle: "italic",
                }}
              >
                &quot;I confirm that I created this content or have obtained all rights and permissions necessary for the uses permitted by Listenify. I have not knowingly included unauthorized copyrighted material. I understand that Listenify may restrict or remove my content following a rights complaint or where required by law.&quot;
              </blockquote>
              <h4 style={{ color: "var(--text-primary)", margin: "14px 0 6px" }}>Accurate Metadata</h4>
              <p>
                Provide accurate track titles, artist names, credits, descriptions and artwork. Do not impersonate other artists or falsely claim ownership of commercial tracks.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
