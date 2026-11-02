import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Terms of Service, Policies & Guidelines",
  description:
    "Official Terms of Service, Privacy Policy, Copyright Policy, Music Upload Guidelines, Copyright Complaint Procedure, and Community Guidelines for Listenify.",
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "var(--space-6) var(--space-4) var(--space-12)" }}>
      {/* Top Header & Fast Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
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
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            transition: "all var(--dur-fast)",
          }}
        >
          <ArrowLeftIcon width={16} height={16} />
          <span>Back to Listenify</span>
        </Link>

        {/* Quick Nav Anchors */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <a
            href="#terms"
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              textDecoration: "none",
              color: "var(--text-secondary)",
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            Terms of Service
          </a>
          <a
            href="#privacy"
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              textDecoration: "none",
              color: "var(--text-secondary)",
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            Privacy Policy
          </a>
          <a
            href="#data-security"
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              textDecoration: "none",
              color: "var(--text-secondary)",
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            Data Security
          </a>
          <a
            href="#copyright"
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              textDecoration: "none",
              color: "var(--text-secondary)",
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            Copyright Policy
          </a>
          <a
            href="#upload-guidelines"
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              textDecoration: "none",
              color: "var(--text-secondary)",
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            Upload Guidelines
          </a>
          <a
            href="#complaint-procedure"
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              textDecoration: "none",
              color: "var(--text-secondary)",
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            Complaint Procedure
          </a>
          <a
            href="#community"
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              textDecoration: "none",
              color: "var(--text-secondary)",
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            Community Guidelines
          </a>
        </div>
      </div>

      {/* Main Flat Document Presentation (No 3D shadows or card box) */}
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
        {/* Header Title */}
        <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "var(--space-6)", marginBottom: "var(--space-8)" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(227, 245, 96, 0.12)",
              color: "var(--brand)",
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              fontSize: "11px",
              fontWeight: "var(--fw-bold)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: "var(--space-2)",
            }}
          >
            Official Legal Documentation
          </span>
          <h1 style={{ fontSize: "30px", fontWeight: "var(--fw-bold)", color: "var(--text-primary)", margin: "6px 0 8px" }}>
            LISTENIFY — TERMS &amp; PLATFORM POLICIES
          </h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>
            Comprehensive terms, privacy policies, copyright enforcement, and upload guidelines.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 1. LISTENIFY — TERMS OF SERVICE */}
        {/* ========================================================================= */}
        <section id="terms" style={{ marginBottom: "var(--space-12)" }}>
          <h2 style={{ fontSize: "24px", color: "var(--text-primary)", margin: "0 0 12px" }}>
            LISTENIFY — TERMS OF SERVICE
          </h2>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.6" }}>
            <p style={{ margin: 0 }}><strong>Effective date:</strong> Launch Date</p>
            <p style={{ margin: 0 }}><strong>Platform operator:</strong> Listenify Platform Team</p>
            <p style={{ margin: 0 }}><strong>Contact:</strong> support@listenify.com</p>
            <p style={{ margin: 0 }}><strong>Website:</strong> https://listenify.com</p>
          </div>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>1. Acceptance of Terms</h3>
          <p>
            Welcome to Listenify (&quot;Listenify&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). Listenify provides a platform through which users may upload, discover, share and listen to music, subject to the features available on the service.
          </p>
          <p>
            By creating an account or using Listenify, you agree to these Terms of Service, our Privacy Policy, Copyright Policy and applicable platform guidelines.
          </p>
          <p>
            <strong>If you do not agree to these terms, do not use the service.</strong>
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>2. Eligibility and Accounts</h3>
          <p>
            You must provide accurate account information and keep your login credentials secure. You are responsible for activities conducted through your account, subject to applicable law.
          </p>
          <p>
            Users under the age of 18 must use the service only where legally permitted and with any required parental or guardian authorization.
          </p>
          <p>
            We may restrict or suspend accounts where we reasonably believe that a user has violated these terms or applicable law.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>3. Music Ownership and Upload Permissions</h3>
          <p>
            You retain ownership of music and other content you upload, subject to rights held by other parties.
          </p>
          <p>By uploading content, you represent that:</p>
          <ul style={{ paddingLeft: "24px", margin: "8px 0" }}>
            <li>You created the content or have obtained all permissions and licences necessary for the uses permitted on Listenify.</li>
            <li>Your upload does not knowingly infringe another person&apos;s copyright, privacy, publicity or other legal rights.</li>
            <li>You have permission to include any samples, beats, recordings, performances, lyrics, artwork or other third-party material contained in your upload.</li>
            <li>The information you provide about the content is accurate to the best of your knowledge.</li>
          </ul>
          <p>
            <em>Purchasing, downloading or possessing an audio file does not by itself grant you permission to distribute or publicly stream it.</em>
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>4. Licence Granted to Listenify</h3>
          <p>
            You retain ownership of your content. You grant Listenify a non-exclusive licence, for the duration your content is available on the service, to host, store, reproduce as technically necessary, transcode, transmit, display associated metadata and stream the content through the features you choose to use.
          </p>
          <p>
            This licence is limited to operating, maintaining, securing and promoting the service as reasonably necessary, including making your music available to listeners in accordance with your account settings.
          </p>
          <p>
            We will not treat this clause as permission to use your music in unrelated commercial releases or to sell your music as our own.
          </p>
          <p>
            You must have the rights necessary to grant this licence. The licence does not override third-party rights.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>5. Prohibited Content</h3>
          <p>You must not upload or share:</p>
          <ul style={{ paddingLeft: "24px", margin: "8px 0" }}>
            <li>Copyrighted music without the necessary authorization.</li>
            <li>Unauthorized commercial recordings, movie soundtracks or music ripped from streaming services.</li>
            <li>Remixes, mashups, covers or sampled music without the permissions required for the relevant use.</li>
            <li>Content that violates applicable law or another person&apos;s legal rights.</li>
            <li>Malware, deceptive files, impersonation content or fraudulent material.</li>
          </ul>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>6. Copyright Complaints and Content Removal</h3>
          <p>
            Listenify provides a process for reporting suspected copyright infringement.
          </p>
          <p>
            We may review complaints, request additional information, restrict access to content, remove content or suspend accounts when appropriate or legally required.
          </p>
          <p>
            We may preserve relevant records where required by law. We may notify affected users and provide a process for responding to or disputing a complaint where appropriate.
          </p>
          <p>
            Repeated or serious violations may result in account termination.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>7. Platform Availability</h3>
          <p>
            We aim to provide a reliable service but do not guarantee uninterrupted access, permanent storage, continuous availability or the preservation of every upload.
          </p>
          <p>
            Features may change, and content may become unavailable for technical, legal, security or operational reasons. Users should maintain their own copies of original music files.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>8. Third-Party Services</h3>
          <p>
            Listenify may rely on third-party hosting, storage, analytics, authentication or streaming services. Their services may be subject to separate terms and privacy practices.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>9. Limitation of Liability</h3>
          <p>
            To the extent permitted by applicable law, Listenify is not responsible for losses arising from interruptions, user-generated content, unauthorized user activity or third-party service failures.
          </p>
          <p>
            Nothing in these terms excludes liability that cannot lawfully be excluded or limits any rights that users have under applicable law. These terms do not guarantee immunity from copyright claims.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>10. Suspension and Termination</h3>
          <p>
            We may suspend or terminate access for violations of these terms, repeated infringement, fraud, security threats or other lawful reasons. Where appropriate, users may appeal a restriction by contacting appeals@listenify.com.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>11. Changes to These Terms</h3>
          <p>
            We may update these terms to reflect changes to our service or legal obligations. We will provide notice of material changes where required by law.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>12. Governing Law</h3>
          <p>
            These terms are intended for an India-focused service and are subject to applicable Indian law. The appropriate jurisdiction and dispute-resolution arrangements must be finalized before publication.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>13. Contact</h3>
          <p>
            For questions about these terms, contact: support@listenify.com
          </p>
        </section>

        {/* ========================================================================= */}
        {/* 2. LISTENIFY — PRIVACY POLICY */}
        {/* ========================================================================= */}
        <section id="privacy" style={{ marginBottom: "var(--space-12)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-8)" }}>
          <h2 style={{ fontSize: "24px", color: "var(--text-primary)", margin: "0 0 12px" }}>
            LISTENIFY — PRIVACY POLICY
          </h2>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.6" }}>
            <p style={{ margin: 0 }}><strong>Privacy contact:</strong> privacy@listenify.com</p>
          </div>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>1. Overview</h3>
          <p>
            Listenify respects your privacy. This policy explains what personal information we collect, why we use it, how it may be shared, how long we retain it and how you can exercise your rights. The exact information processed depends on the features you use and the technical services integrated into Listenify.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>2. Information We May Collect</h3>
          <h4 style={{ fontSize: "15px", color: "var(--text-primary)", margin: "14px 0 4px" }}>Account information</h4>
          <ul style={{ paddingLeft: "24px", margin: "6px 0" }}>
            <li>Username and display name.</li>
            <li>Email address and authentication identifiers.</li>
            <li>Profile picture, biography and preferences you choose to provide.</li>
          </ul>

          <h4 style={{ fontSize: "15px", color: "var(--text-primary)", margin: "14px 0 4px" }}>Music and user-generated content</h4>
          <ul style={{ paddingLeft: "24px", margin: "6px 0" }}>
            <li>Uploaded audio files, titles, descriptions, artwork, lyrics and tags.</li>
            <li>Artist profiles, playlists, likes, comments and other interactions, if supported.</li>
            <li>Ownership declarations and related upload records.</li>
          </ul>

          <h4 style={{ fontSize: "15px", color: "var(--text-primary)", margin: "14px 0 4px" }}>Technical and usage information</h4>
          <ul style={{ paddingLeft: "24px", margin: "6px 0" }}>
            <li>IP address, device and browser information, diagnostic logs and security events.</li>
            <li>Playback events, feature usage and error reports, where collected.</li>
            <li>Cookies or similar technologies used for authentication, security and preferences.</li>
          </ul>

          <h4 style={{ fontSize: "15px", color: "var(--text-primary)", margin: "14px 0 4px" }}>Support and copyright complaints</h4>
          <ul style={{ paddingLeft: "24px", margin: "6px 0" }}>
            <li>Information you submit through support requests, copyright reports, appeals or other communications.</li>
            <li>Evidence provided to assess a rights claim.</li>
          </ul>
          <p>
            We do not intentionally request sensitive personal information unless it is necessary for a specific, lawful purpose.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>3. How We Use Information</h3>
          <p>We may use information to:</p>
          <ul style={{ paddingLeft: "24px", margin: "6px 0" }}>
            <li>Create and manage accounts.</li>
            <li>Host and stream music.</li>
            <li>Personalize discovery and recommendations, where enabled.</li>
            <li>Maintain platform security and prevent fraud or abuse.</li>
            <li>Review copyright complaints and enforce our policies.</li>
            <li>Respond to support requests.</li>
            <li>Improve performance and reliability.</li>
            <li>Meet applicable legal obligations.</li>
          </ul>
          <p>We will not use personal information for unrelated purposes without an appropriate legal basis.</p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>4. How We Share Information</h3>
          <p>
            We may share information with service providers that help operate Listenify, such as hosting, storage, authentication, email delivery and security providers.
          </p>
          <p>
            We may also disclose information when legally required, to respond to valid legal requests, to protect rights and safety, or in connection with a lawful business reorganization. We do not promise that information will never be disclosed. Any disclosure must be handled in accordance with applicable law and our actual practices.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>5. Public Information</h3>
          <p>
            Information you choose to publish, such as your public username, artist profile, uploaded music and public playlists, may be visible to other users. Do not include private information in public track descriptions, artwork, comments or profile fields.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>6. Cookies and Analytics</h3>
          <p>
            Listenify may use essential cookies for authentication, security and session management. Optional analytics or advertising technologies, if introduced, will be disclosed and managed as required by applicable law.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>7. Data Retention</h3>
          <p>
            We retain personal information for as long as reasonably necessary for the purposes described in this policy, including account operation, security, dispute resolution and legal compliance. Deletion requests may be subject to lawful retention requirements, including preservation of records relevant to copyright complaints or legal proceedings.
          </p>

          <h3 id="data-security" style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>
            8. User Data Security &amp; Protection
          </h3>
          <p>
            Listenify is committed to protecting the privacy, confidentiality, and integrity of your personal information and uploaded media. We enforce industry-standard technical, administrative, and physical safeguards:
          </p>
          <ul style={{ paddingLeft: "24px", margin: "8px 0" }}>
            <li>
              <strong>Encryption in Transit:</strong> All communications between your browser or mobile client and Listenify servers are strictly encrypted using TLS 1.3 / SSL protocols.
            </li>
            <li>
              <strong>Storage Safeguards &amp; Access Controls:</strong> Uploaded audio files, profile metadata, and playlist records are stored in secure cloud environments with strict role-based access controls (RBAC) and least-privilege architecture.
            </li>
            <li>
              <strong>Credential &amp; Authentication Security:</strong> Passwords, session tokens, and authentication cookies are salted, hashed, or protected with secure attributes (HttpOnly, SameSite, Secure) to defend against session hijacking and XSS attacks.
            </li>
            <li>
              <strong>Protection of User-Uploaded Audio:</strong> Your original music files and private library records are isolated to prevent unauthorized tampering, scraping, or automated extraction.
            </li>
            <li>
              <strong>Incident Response &amp; Breach Notification:</strong> In the event of a security incident affecting your personal data, Listenify maintains rapid containment protocols and will notify impacted users and regulatory authorities in accordance with applicable Indian data protection laws.
            </li>
            <li>
              <strong>User Security Responsibilities:</strong> Users must maintain strong, unique credentials and refrain from sharing account credentials. If you suspect unauthorized access or security vulnerabilities, promptly alert our security team at <code>security@listenify.com</code>.
            </li>
          </ul>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>9. Your Privacy Rights</h3>
          <p>
            Subject to applicable law, you may request access to, correction of or deletion of personal information, withdraw consent where processing relies on consent, and raise privacy grievances through the contact below.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>10. Children</h3>
          <p>
            Listenify is not intended to collect children&apos;s personal information in violation of applicable law. We will implement age-related safeguards where required.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>11. International Processing</h3>
          <p>
            Some service providers may process information outside India. Where applicable, we will address international transfers in accordance with relevant legal requirements.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>12. Changes to This Policy</h3>
          <p>
            We may update this policy as our services, data practices or legal obligations change. The revised version will identify its effective date.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>13. Contact and Privacy Grievances</h3>
          <p>
            Privacy contact: privacy@listenify.com<br />
            Grievance contact: grievance@listenify.com
          </p>
        </section>

        {/* ========================================================================= */}
        {/* 3. LISTENIFY — COPYRIGHT POLICY */}
        {/* ========================================================================= */}
        <section id="copyright" style={{ marginBottom: "var(--space-12)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-8)" }}>
          <h2 style={{ fontSize: "24px", color: "var(--text-primary)", margin: "0 0 12px" }}>
            LISTENIFY — COPYRIGHT POLICY
          </h2>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>1. Our Commitment</h3>
          <p>
            Listenify respects the rights of musicians, composers, lyricists, producers, labels, performers and other copyright owners. Users must upload only content they own or are authorized to use in the ways enabled by the platform.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>2. What Is Not Permitted</h3>
          <p>Unless the required rights or permissions have been obtained, users must not upload or distribute:</p>
          <ul style={{ paddingLeft: "24px", margin: "8px 0" }}>
            <li>Commercial songs belonging to other artists or labels.</li>
            <li>Music extracted from films, music videos or streaming services.</li>
            <li>Unauthorized remixes, mashups, covers or samples.</li>
            <li>Recordings that incorporate protected compositions, lyrics or performances without the necessary permissions.</li>
            <li>Content uploaded in a manner that exceeds the scope of an existing licence.</li>
          </ul>
          <p>
            <em>Crediting the artist, linking to the original song, stating &quot;no copyright infringement intended&quot; or making the upload free does not automatically grant permission.</em>
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>3. How to Report Infringement</h3>
          <p>
            A rights holder or authorized representative can submit a report through the <strong>Report Song</strong> feature in the 3-dot track menu (select <strong>&quot;Report copyright infringement&quot;</strong>) or contact:
          </p>
          <p><strong>Copyright email:</strong> copyright@listenify.com</p>
          <p>Please provide:</p>
          <ol style={{ paddingLeft: "24px", margin: "6px 0" }}>
            <li>Your full name and contact details.</li>
            <li>The title and URL of each reported track.</li>
            <li>Identification of the copyrighted work and your relationship to it.</li>
            <li>An explanation of why the upload is unauthorized.</li>
            <li>Supporting evidence or relevant documentation.</li>
            <li>A declaration that the information provided is accurate and that you are authorized to submit the complaint.</li>
          </ol>
          <p>Please do not send unnecessary sensitive personal information.</p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>4. Review and Action</h3>
          <p>
            We may acknowledge receipt, request clarification, assess supporting material and take appropriate action. Depending on the circumstances and applicable legal requirements, we may disable access to the reported track, remove it, restrict the account, preserve relevant records or notify the uploader.
          </p>
          <p>
            A report is not automatically proof of infringement. However, we may temporarily restrict access while a credible claim is reviewed. We will follow applicable statutory procedures and deadlines.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>5. Counter-Notifications and Disputes</h3>
          <p>
            If your music is removed or disabled and you believe the action was mistaken, contact <strong>copyright-appeals@listenify.com</strong>. Include the track URL, your explanation, evidence of ownership or authorization, and any other relevant information. Reinstatement is not guaranteed, particularly where a legal order or unresolved rights dispute prevents it.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>6. Repeat Infringers</h3>
          <p>
            We may warn, restrict or terminate accounts that repeatedly upload infringing content or knowingly abuse the platform.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>7. False or Abusive Reports</h3>
          <p>
            Reports must be submitted honestly and in good faith. Knowingly false claims, impersonation of rights holders or abusive reporting may result in restrictions or other appropriate action.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>8. No Guarantee of Legal Immunity</h3>
          <p>
            This policy describes our intended procedures. It does not waive any rights, eliminate copyright liability or guarantee that Listenify qualifies for any statutory intermediary protection.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>9. Contact</h3>
          <p>
            Copyright complaints: copyright@listenify.com<br />
            Copyright appeals: copyright-appeals@listenify.com<br />
            General support: support@listenify.com
          </p>
        </section>

        {/* ========================================================================= */}
        {/* 4. LISTENIFY — MUSIC UPLOAD GUIDELINES */}
        {/* ========================================================================= */}
        <section id="upload-guidelines" style={{ marginBottom: "var(--space-12)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-8)" }}>
          <h2 style={{ fontSize: "24px", color: "var(--text-primary)", margin: "0 0 12px" }}>
            LISTENIFY — MUSIC UPLOAD GUIDELINES
          </h2>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>1. Upload Music You Have the Right to Share</h3>
          <p>
            Before uploading a track, ensure that you own or have permission for every relevant component, which may include:
          </p>
          <ul style={{ paddingLeft: "24px", margin: "8px 0" }}>
            <li>The sound recording.</li>
            <li>The underlying musical composition.</li>
            <li>Lyrics.</li>
            <li>Samples, beats and loops.</li>
            <li>Performances and collaborations.</li>
            <li>Cover artwork and other accompanying material.</li>
          </ul>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>2. Original Music</h3>
          <p>
            Original music may be uploaded if you have the necessary rights and any required permissions from collaborators, performers, producers or other contributors. Keep project files, release records or agreements that may help establish your rights.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>3. Covers, Remixes and Mashups</h3>
          <p>
            Do not assume that permission to record a cover, use a beat, or remix a song automatically permits distribution and streaming on Listenify. Obtain the permissions required for your specific use, including applicable composition, recording, sampling and performance rights.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>4. Commercial Music</h3>
          <p>
            Do not upload Bollywood songs, label releases, movie soundtracks or other commercial recordings unless you have obtained the necessary authorization for the intended platform use.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>5. AI-Generated Music</h3>
          <p>
            You may upload AI-generated music only if your use complies with the applicable law, the relevant tool&apos;s licence and the rights of any third parties whose material is incorporated. Do not use AI tools to impersonate an artist deceptively or upload unauthorized copies or imitations of protected recordings.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>6. Required Upload Declaration</h3>
          <p>Before publishing, you must confirm:</p>
          <blockquote
            style={{
              padding: "16px 20px",
              background: "var(--bg-surface-2)",
              borderLeft: "4px solid var(--brand)",
              borderRadius: "var(--radius-sm)",
              margin: "16px 0",
              fontStyle: "italic",
              color: "var(--text-primary)",
            }}
          >
            &quot;I confirm that I created this content or have obtained all rights and permissions necessary for the uses permitted by Listenify. I have not knowingly included unauthorized copyrighted material. I understand that Listenify may restrict or remove my content following a rights complaint or where required by law.&quot;
          </blockquote>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>7. Accurate Metadata</h3>
          <p>
            Provide accurate track titles, artist names, credits, descriptions and artwork. Do not impersonate another artist or falsely claim ownership.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "22px 0 8px" }}>8. Moderation</h3>
          <p>
            Listenify may review, restrict or remove uploads that violate these guidelines or applicable law. Users may appeal moderation decisions through support@listenify.com.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* 5. LISTENIFY — COPYRIGHT COMPLAINT PROCEDURE */}
        {/* ========================================================================= */}
        <section id="complaint-procedure" style={{ marginBottom: "var(--space-12)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-8)" }}>
          <h2 style={{ fontSize: "24px", color: "var(--text-primary)", margin: "0 0 12px" }}>
            LISTENIFY — COPYRIGHT COMPLAINT PROCEDURE
          </h2>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>Step 1: Submit a Complaint</h3>
          <p>
            Use the Report Song option in the song menu or email copyright@listenify.com. Identify the track and provide your contact information, rights information and explanation of the alleged infringement.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>Step 2: Acknowledgement and Initial Review</h3>
          <p>
            We will assess whether the report identifies the content and explains the claimed rights sufficiently for review. We may request further details. An incomplete report may delay assessment unless immediate action is otherwise required.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>Step 3: Assess the Evidence</h3>
          <p>
            We may examine available release information, licences, contracts, authorization records and the uploader&apos;s response. We do not require a single universal type of evidence because the appropriate proof varies by claim.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>Step 4: Restrict Access When Appropriate</h3>
          <p>
            We may temporarily disable access while investigating a credible claim. Where applicable law requires removal or other action, we will follow the relevant procedure and deadline.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>Step 5: Notify the Uploader Where Appropriate</h3>
          <p>
            We may inform the uploader of the complaint, subject to legal restrictions and safety considerations. We may invite evidence of ownership or authorization.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>Step 6: Resolve or Escalate</h3>
          <p>Possible outcomes include:</p>
          <ul style={{ paddingLeft: "24px", margin: "6px 0" }}>
            <li>No action where the report is unsupported or the content is authorized.</li>
            <li>Continued restriction or removal where appropriate.</li>
            <li>Further investigation if the evidence is inconclusive.</li>
            <li>Referral to legal counsel or compliance personnel where necessary.</li>
          </ul>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>Step 7: Appeal</h3>
          <p>
            Affected users may submit relevant information to copyright-appeals@listenify.com. We will assess the appeal and communicate the outcome where appropriate. Content will not automatically be restored if a dispute remains unresolved or a legal requirement prevents reinstatement.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>Step 8: Preserve Records</h3>
          <p>
            We will preserve relevant complaint records and associated information for the periods required by applicable law and our documented retention policies.
          </p>

          <h4 style={{ fontSize: "16px", color: "var(--text-primary)", margin: "18px 0 6px" }}>Required Complaint Details</h4>
          <ul style={{ paddingLeft: "24px", margin: "6px 0" }}>
            <li>Claimant&apos;s name and contact information.</li>
            <li>Reported song title and URL.</li>
            <li>Identification of the copyrighted work.</li>
            <li>Explanation of ownership or authority to act.</li>
            <li>Supporting evidence, where available.</li>
            <li>Declaration of good faith and accuracy.</li>
            <li>Date received, action taken and outcome.</li>
          </ul>
        </section>

        {/* ========================================================================= */}
        {/* 6. LISTENIFY — COMMUNITY GUIDELINES */}
        {/* ========================================================================= */}
        <section id="community" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-8)" }}>
          <h2 style={{ fontSize: "24px", color: "var(--text-primary)", margin: "0 0 12px" }}>
            LISTENIFY — COMMUNITY GUIDELINES
          </h2>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>1. Respect Artists</h3>
          <p>
            Credit artists accurately and respect their creative work. Do not falsely claim ownership, impersonate artists or misrepresent your relationship with them.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>2. No Copyright Abuse</h3>
          <p>
            Do not upload unauthorized music, evade content restrictions by re-uploading removed material, or repeatedly distribute content after being informed that you lack permission.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>3. Honest Reporting</h3>
          <p>
            Report suspected infringement in good faith. Do not submit knowingly false reports to harass competitors, silence artists or remove lawful content.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>4. No Harassment or Threats</h3>
          <p>
            Do not threaten, stalk, harass, dox or abuse other users. Respect the privacy and safety of artists and listeners.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>5. No Spam or Fraud</h3>
          <p>
            Do not manipulate engagement, distribute malicious files, impersonate others, run fraudulent promotions or exploit platform features.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>6. Enforcement</h3>
          <p>
            Depending on the conduct, Listenify may issue warnings, restrict features, disable content, suspend accounts or terminate access. Decisions will be handled consistently with applicable law and our published procedures.
          </p>

          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", margin: "20px 0 8px" }}>7. Reporting &amp; Contact</h3>
          <p>
            Report suspected violations through support@listenify.com or the appropriate in-app reporting feature.
          </p>
        </section>
      </article>
    </div>
  );
}
