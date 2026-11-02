import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div className="page-header__content">
        <h1 className="h2 page-header__title">{title}</h1>
        {description ? <p className="text-muted page-header__desc">{description}</p> : null}
      </div>
      {action ? <div className="page-header__action">{action}</div> : null}
    </div>
  );
}
