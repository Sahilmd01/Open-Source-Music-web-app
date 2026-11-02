import type { InputHTMLAttributes } from "react";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function Switch({ label, ...rest }: SwitchProps) {
  return (
    <label className="check">
      <span className="switch">
        <input type="checkbox" role="switch" {...rest} />
        <span className="switch__track" />
      </span>
      {label}
    </label>
  );
}
