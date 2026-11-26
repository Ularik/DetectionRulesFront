"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { routes } from "@/shared/config";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/shared/ui/sheet";
import { MitreTechniqueCard } from "@/entities/mitre-technique";

// Ссылка на технику MITRE внутри инцидента: обычный клик открывает карточку техники
// в боковой панели, не уводя со страницы; Ctrl/⌘/средняя кнопка — как обычная ссылка
export function MitreTechniqueLink({
  mitreId,
  className,
  children,
}: {
  mitreId: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    setOpen(true);
  };

  return (
    <>
      <Link href={routes.mitreTechnique(mitreId)} onClick={handleClick} className={className}>
        {children}
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent aria-describedby={undefined} className="p-5">
          <SheetTitle className="sr-only">Техника MITRE ATT&CK {mitreId}</SheetTitle>
          {open && (
            <MitreTechniqueCard
              mitreId={mitreId}
              closeSlot={
                <SheetClose
                  aria-label="Закрыть карточку техники"
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#111827] hover:bg-surface-muted"
                >
                  <X className="size-[18px]" />
                </SheetClose>
              }
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
