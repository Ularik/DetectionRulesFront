"use client";

import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  ANALYST_STATUSES,
  INCIDENT_STATUS_LABELS,
  isAnalystStatus,
  type Incident,
} from "@/entities/incident";
import { useChangeIncidentStatus } from "../model/useChangeIncidentStatus";

export function IncidentStatusSelect({
  incident,
}: {
  incident: Pick<Incident, "incident_id" | "analyst_status">;
}) {
  const updateStatus = useChangeIncidentStatus();

  return (
    <div className="grid gap-1">
      <label
        htmlFor="incident-analyst-status"
        className="text-xs font-medium text-gray-500"
      >
        Статус аналитика
      </label>
      <Select
        value={incident.analyst_status}
        disabled={updateStatus.isPending}
        onValueChange={(value) => {
          if (!isAnalystStatus(value) || value === incident.analyst_status) {
            return;
          }

          updateStatus.mutate(
            {
              incidentId: incident.incident_id,
              analystStatus: value,
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
        <SelectTrigger
          id="incident-analyst-status"
          className="w-48 bg-white"
          aria-label="Изменить статус аналитика"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ANALYST_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {INCIDENT_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
