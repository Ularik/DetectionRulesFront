"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { SyncMitreMutation } from "../model/useSyncMitre";

export function SyncMitreButton({ sync }: { sync: SyncMitreMutation }) {
  return (
    <Button
      onClick={() => sync.mutate()}
      disabled={sync.isPending}
      aria-label="Синхронизировать MITRE ATT&CK"
    >
      <RefreshCw
        aria-hidden="true"
        className={`h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`}
      />
      {sync.isPending ? "Синхронизация..." : "Синхронизировать"}
    </Button>
  );
}
