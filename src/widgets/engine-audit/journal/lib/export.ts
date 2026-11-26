import {
  describeEngineAudit,
  getEngineActionLabel,
  getEngineResourceLabel,
  type EngineAuditType,
} from "@/entities/audit";
import { formatAuditTimestamp } from "./format";

const escapeCell = (value: string) => (/[",;\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

function download(content: string, type: string, extension: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `audit-${new Date().toISOString().slice(0, 10)}.${extension}`;
  link.click();
  URL.revokeObjectURL(url);
}

/** CSV (UTF-8 с BOM, разделитель «;» — открывается в Excel) */
export function exportAuditCsv(items: EngineAuditType[]) {
  const header = ["ID", "Дата и время", "Пользователь", "Роль", "Действие", "Тип объекта", "Объект (ID)", "Организация", "Описание"];
  const rows = items.map((item) => [
    item.audit_id,
    formatAuditTimestamp(item.timestamp),
    item.actor ?? "",
    item.role ?? "",
    getEngineActionLabel(item),
    getEngineResourceLabel(item.resource_type),
    item.resource_id ?? "",
    item.organization_id ?? "",
    describeEngineAudit(item),
  ]);
  const csv = [header, ...rows].map((row) => row.map(escapeCell).join(";")).join("\r\n");
  download(`﻿${csv}`, "text/csv;charset=utf-8", "csv");
}

/** JSON со снимками до / после — для разбора инцидентов */
export function exportAuditJson(items: EngineAuditType[]) {
  download(JSON.stringify(items, null, 2), "application/json", "json");
}
