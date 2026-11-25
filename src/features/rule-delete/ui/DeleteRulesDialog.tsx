"use client";

import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useDeleteRule } from "../model/useDeleteRule";

type Props = {
  ruleIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Вызывается с id успешно удалённых правил */
  onDeleted?: (ruleIds: string[]) => void;
};

// Подтверждение удаления одного или нескольких правил обнаружения
export function DeleteRulesDialog({ ruleIds, open, onOpenChange, onDeleted }: Props) {
  const { mutateAsync, isPending } = useDeleteRule({ silent: true });

  const handleDelete = async () => {
    const results = await Promise.allSettled(ruleIds.map((ruleId) => mutateAsync(ruleId)));
    const deleted = ruleIds.filter((_, index) => results[index].status === "fulfilled");
    if (deleted.length) {
      toast.success(
        deleted.length === 1 ? `Правило ${deleted[0]} удалено` : `Удалено правил: ${deleted.length}`,
        { position: "top-center" },
      );
      onDeleted?.(deleted);
    }
    onOpenChange(false);
  };

  const single = ruleIds.length === 1;

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>{single ? "Удалить правило?" : `Удалить правила (${ruleIds.length})?`}</DialogTitle>
        <DialogDescription className="break-words">
          {single
            ? `Правило ${ruleIds[0]} будет удалено без возможности восстановления.`
            : `Будут удалены без возможности восстановления: ${ruleIds.join(", ")}.`}
        </DialogDescription>
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
            {isPending ? "Удаление..." : "Удалить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
