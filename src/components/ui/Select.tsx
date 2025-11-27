import { type SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-xs text-slate-50 shadow-sm outline-none transition-colors focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500",
        className
      )}
      {...props}
    />
  );
}
