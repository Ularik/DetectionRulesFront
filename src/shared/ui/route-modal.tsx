"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { XIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./dialog";

// Модалка для перехваченного маршрута (intercepting route): закрытие = шаг назад в истории,
// поэтому URL возвращается к списку, а «вперёд» снова открывает модалку
export function RouteModal({
  title,
  className,
  closeClassName,
  closeHref,
  children,
}: {
  title: string;
  className?: string;
  /** Позиция крестика, если у содержимого своя шапка (по умолчанию top-6 right-5) */
  closeClassName?: string;
  /**
   * Куда уйти при закрытии вместо шага назад. Нужен, когда модалка открыта прямым заходом/F5:
   * тогда в истории может не быть страницы-подложки, и back() увёл бы из приложения
   */
  closeHref?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const close = () => (closeHref ? router.replace(closeHref) : router.back());

  return (
    <Dialog defaultOpen onOpenChange={(open) => !open && close()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white sm:max-w-[min(1431px,calc(100%-2rem))]",
          className,
        )}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {children}
        {/* Крестик по макету CERT-KG SIEM: тёмно-синий квадрат 20px */}
        <DialogClose
          className={cn(
            "absolute top-6 right-5 flex size-5 items-center justify-center rounded-[5px] border border-white bg-brand text-white hover:bg-brand-light focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:outline-hidden",
            closeClassName,
          )}
        >
          <XIcon className="size-3.5" strokeWidth={2.5} />
          <span className="sr-only">Закрыть</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
