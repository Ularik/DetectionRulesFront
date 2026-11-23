"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

interface CopyButtonProps {
  value: string;
  /** Подпись для aria-label/title, например «Копировать IOC» */
  label?: string;
  /** Текст тоста при успешном копировании */
  successMessage?: string;
  className?: string;
}

// Иконка «копировать»: копирует value в буфер обмена, на 2 с показывает галочку
export function CopyButton({
  value,
  label = "Копировать",
  successMessage = "Скопировано",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(
      () => {
        setCopied(true);
        toast.success(successMessage);
      },
      () => toast.error("Не удалось скопировать"),
    );
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-light/30 focus-visible:outline-none",
        className,
      )}
    >
      {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
    </button>
  );
}
