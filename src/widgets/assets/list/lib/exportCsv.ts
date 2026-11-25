import {
  ASSET_CRITICALITY_LABELS,
  getAssetEnvironmentLabel,
  getAssetTypeLabel,
  type Asset,
} from "@/entities/asset";

const escapeCell = (value: string) => (/[",;\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

// Выгрузка отфильтрованного реестра в CSV (UTF-8 с BOM, разделитель «;» — открывается в Excel)
export function exportAssetsCsv(assets: Asset[], organizationName: (id: string | null) => string) {
  const header = [
    "ID",
    "Имя актива",
    "IP-адрес",
    "Организация",
    "Тип",
    "Критичность",
    "Статус",
    "Среда",
    "Хосты",
    "Теги",
    "Описание",
  ];
  const rows = assets.map((asset) => [
    asset.asset_id,
    asset.name,
    asset.ip,
    organizationName(asset.organization_id),
    getAssetTypeLabel(asset.asset_type),
    ASSET_CRITICALITY_LABELS[asset.criticality] ?? asset.criticality,
    asset.enabled ? "Активен" : "Неактивен",
    getAssetEnvironmentLabel(asset.environment),
    asset.hostnames.join(", "),
    asset.tags.join(", "),
    asset.description ?? "",
  ]);

  const csv = [header, ...rows].map((row) => row.map((cell) => escapeCell(cell)).join(";")).join("\r\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `assets-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
