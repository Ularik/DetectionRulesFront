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

// navigator.clipboard есть только в secure context (HTTPS/localhost); по обычному http
// он undefined — тогда копируем через скрытый textarea и execCommand("copy")
export function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      if (document.execCommand("copy")) resolve();
      else reject(new Error("execCommand copy failed"));
    } catch (error) {
      reject(error);
    } finally {
      document.body.removeChild(textarea);
    }
  });
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
    copyToClipboard(value).then(
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
