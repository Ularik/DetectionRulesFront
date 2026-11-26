"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { routes } from "@/shared/config";
import { MitreTechniqueCard } from "@/entities/mitre-technique";

// Карточка техники в разделе MITRE: закрытие — возврат к списку
export function MitreTechniqueDetails({ mitreId }: { mitreId: string }) {
  return (
    <MitreTechniqueCard
      mitreId={mitreId}
      closeSlot={
        <Link
          href={routes.mitre}
          scroll={false}
          aria-label="Закрыть карточку техники"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#111827] hover:bg-surface-muted"
        >
          <X className="size-[18px]" />
        </Link>
      }
      errorActions={
        <Button variant="ghost" asChild>
          <Link href={routes.mitre}>К списку техник</Link>
        </Button>
      }
    />
  );
}
