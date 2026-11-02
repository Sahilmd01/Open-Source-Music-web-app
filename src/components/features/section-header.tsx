import Link from "next/link";

export function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="section__head">
      <h2 className="h3">{title}</h2>
      {href ? <Link href={href} className="section__link">See all</Link> : null}
    </div>
  );
}
