import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  status?: "default" | "success" | "error";
}

export function Field({ label, hint, status = "default", className, id, ...rest }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn("field", status === "success" && "is-success", status === "error" && "is-error")}>
      <label className="label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={cn("input", className)}
        aria-invalid={status === "error" || undefined}
        aria-describedby={hintId}
        {...rest}
      />
      {hint ? (
        <span id={hintId} className="hint" role={status === "error" ? "alert" : undefined}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
