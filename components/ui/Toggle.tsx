import React, { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Toggle({ className, ...props }: ToggleProps) {
  return (
    <label
      className={cn("inline-flex items-center gap-2 cursor-pointer", className)}
    >
      <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-700 transition-colors data-[checked=true]:bg-red-500">
        <input type="checkbox" className="peer sr-only" {...props} />
        <span className="pointer-events-none inline-block h-4 w-4 translate-x-0 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
