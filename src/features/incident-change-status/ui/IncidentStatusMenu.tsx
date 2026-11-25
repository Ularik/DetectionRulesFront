"use client";

import { useState } from "react";
import { Check, Settings } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";
import {
  ANALYST_STATUSES,
  INCIDENT_STATUS_LABELS,
  type Incident,
} from "@/entities/incident";
import { useChangeIncidentStatus } from "../model/useChangeIncidentStatus";

// Кнопка «Изменить статус» из макета модалки инцидента: список статусов во всплывающем меню
export function IncidentStatusMenu({
  incident,
}: {
  incident: Pick<Incident, "incident_id" | "analyst_status">;
}) {
  const [open, setOpen] = useState(false);
  const updateStatus = useChangeIncidentStatus();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={updateStatus.isPending}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#0965c5] bg-white px-3.5 text-sm font-medium text-[#0965c5] transition-colors hover:bg-[#f2f9ff] disabled:opacity-60"
      >
        Изменить статус
        <Settings className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <ul role="listbox" aria-label="Статус аналитика">
          {ANALYST_STATUSES.map((status) => {
            const selected = status === incident.analyst_status;
            return (
              <li key={status}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-100",
                    selected && "font-semibold text-[#0965c5]",
                  )}
                  onClick={() => {
                    setOpen(false);
                    if (selected) return;

                    updateStatus.mutate(
                      {
                        incidentId: incident.incident_id,
                        analystStatus: status,
                      },
                      {
                        onSuccess: () =>
                          toast.success("Статус инцидента обновлен", {
                            position: "top-center",
                          }),
                        onError: () =>
                          toast.error("Не удалось обновить статус", {
                            position: "top-center",
                          }),
                      },
                    );
                  }}
                >
                  {INCIDENT_STATUS_LABELS[status]}
                  {selected && <Check className="size-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
