import Link from "next/link";
import { CoverArt } from "@/components/ui/cover-art";

interface MediaCardProps {
  title: string;
  subtitle: string;
  hue: number;
  src?: string;
  href?: string;
  badge?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function MediaCard({ title, subtitle, hue, src, href, badge, className = "", actions }: MediaCardProps) {
  const coverAndInfo = (
    <>
      <div style={{ position: "relative" }}>
        <CoverArt hue={hue} src={src} className="media-card__cover" />
        {badge && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              fontSize: "0.68rem",
              fontWeight: "var(--fw-semibold)",
              background: "var(--info-soft)",
              color: "var(--info-text)",
              backdropFilter: "blur(8px)",
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--info-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <h3 className="h4">{title}</h3>
      <p className="text-muted text-small">{subtitle}</p>
    </>
  );

  const mainLink = href ? (
    <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      {coverAndInfo}
    </Link>
  ) : (
    coverAndInfo
  );

  return (
    <article className={`media-card ${className}`.trim()} style={{ cursor: href && !actions ? "pointer" : "default" }}>
      {mainLink}
      {actions && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: "var(--space-2)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}
    </article>
  );
}

