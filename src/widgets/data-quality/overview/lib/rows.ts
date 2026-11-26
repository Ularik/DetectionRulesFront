import type { SourceType } from "@/entities/source";
import {
  UNRESOLVED_SOURCE_ID,
  type DataQualitySource,
  type DataQualityStats,
} from "@/entities/data-quality";

/** Строка таблицы: статистика Data Quality + сведения из справочника источников */
export interface QualityRow {
  id: string;
  name: string;
  organizationId: string | null;
  sourceType: string | null;
  profiles: string[];
  /** null — за период событий от источника не было */
  stats: DataQualityStats | null;
  /** null — источника нет в справочнике (например, неопознанные события) */
  enabled: boolean | null;
}

/** Склеивает /data-quality/sources со справочником /sources; источники без событий тоже попадают
 * в таблицу (если не задан фильтр по профилю — тогда показываем только то, что вернул backend) */
export function buildRows(
  items: DataQualitySource[],
  sources: SourceType[],
  { includeIdle }: { includeIdle: boolean },
): QualityRow[] {
  const byId = new Map(sources.map((source) => [source.source_id, source]));
  const rows: QualityRow[] = items.map((item) => {
    const source = byId.get(item.source_id);
    return {
      id: item.source_id,
      name:
        item.source_id === UNRESOLVED_SOURCE_ID
          ? `Не определён (${item.source_name})`
          : source?.name ?? item.source_name,
      organizationId: item.organization_id ?? source?.organization_id ?? null,
      sourceType: source?.source_type ?? null,
      profiles: item.profiles.length
        ? item.profiles
        : source?.normalization_profile
          ? [source.normalization_profile]
          : [],
      stats: item,
      enabled: source ? source.enabled : null,
    };
  });

  if (includeIdle) {
    const seen = new Set(items.map((item) => item.source_id));
    for (const source of sources) {
      if (seen.has(source.source_id)) continue;
      rows.push({
        id: source.source_id,
        name: source.name,
        organizationId: source.organization_id,
        sourceType: source.source_type,
        profiles: source.normalization_profile ? [source.normalization_profile] : [],
        stats: null,
        enabled: source.enabled,
      });
    }
  }
  return rows;
}
