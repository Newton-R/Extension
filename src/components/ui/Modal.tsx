import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  className,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-999999 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "w-full max-w-md rounded-2xl bg-slate-950 text-slate-50 shadow-recorder-xl",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-4 py-3 text-xs text-slate-100">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-800 px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
