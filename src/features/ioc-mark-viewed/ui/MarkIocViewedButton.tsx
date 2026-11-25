"use client";

import { Check, Eye, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useMarkIocViewed } from "../model/useMarkIocViewed";

interface MarkIocViewedButtonProps {
  iocId: string;
  viewed: boolean;
  className?: string;
}

export function MarkIocViewedButton({ iocId, viewed, className }: MarkIocViewedButtonProps) {
  const markViewed = useMarkIocViewed();

  if (viewed) {
    return (
      <span
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-sm font-medium whitespace-nowrap text-emerald-700",
          className,
        )}
      >
        <Check className="size-4" aria-hidden />
        Просмотрено
      </span>
    );
  }

  return (
    <Button
      onClick={() => markViewed.mutate(iocId)}
      disabled={markViewed.isPending}
      className={cn("h-8 bg-brand px-3 text-white hover:bg-brand-light", className)}
    >
      {markViewed.isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Eye className="size-4" aria-hidden />
      )}
      Отметить просмотренным
    </Button>
  );
}
