"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

export function AssetRowMenu({
  assetName,
  onEdit,
  onDelete,
}: {
  assetName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const itemClass =
    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Действия: ${assetName}`}
          className="flex size-8 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface-muted"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 bg-white p-1.5">
        <button
          type="button"
          className={`${itemClass} text-ink hover:bg-surface-muted`}
          onClick={() => {
            setOpen(false);
            onEdit();
          }}
        >
          <Pencil className="size-4" />
          Изменить
        </button>
        <button
          type="button"
          className={`${itemClass} text-red-600 hover:bg-red-50`}
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
        >
          <Trash2 className="size-4" />
          Удалить
        </button>
      </PopoverContent>
    </Popover>
  );
}
