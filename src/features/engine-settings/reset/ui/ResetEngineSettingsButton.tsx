"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import { useResetEngineSettings } from "../model/useResetEngineSettings";

// POST /engine-settings/reset — с подтверждением, т. к. затирает текущие настройки движка
export function ResetEngineSettingsButton({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useResetEngineSettings();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled || isPending}
        className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium whitespace-nowrap text-ink-muted transition-colors hover:bg-white hover:text-red-600 disabled:opacity-50"
      >
        <RotateCcw className="size-4" />
        Значения по умолчанию
      </button>

      <Dialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Сбросить настройки движка?</DialogTitle>
          <DialogDescription>
            Все параметры корреляции, скоринга, порогов и трекера атак вернутся к значениям по умолчанию.
            Текущие значения будут потеряны.
          </DialogDescription>
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => mutate(undefined, { onSuccess: () => setOpen(false) })}
            >
              {isPending ? "Сброс..." : "Сбросить"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
