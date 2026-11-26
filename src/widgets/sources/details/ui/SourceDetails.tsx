"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Boxes,
  CircleAlert,
  CircleCheck,
  CircleX,
  Database,
  FileText,
  Info,
  Landmark,
  Activity,
  SquarePen,
  X,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import {
  DEFAULT_HEALTH_OFFLINE_SECONDS,
  DEFAULT_HEALTH_WARNING_SECONDS,
  SOURCE_HEALTH_LABELS,
  SourceStatusBadge,
  SourceTag,
  formatSeconds,
  formatSourceDateTime,
  formatThreshold,
  getSourceTypeLabel,
  useSource,
  useSourceHealth,
  type SourceHealthStatus,
  type SourceType,
} from "@/entities/source";
import { DataQualityDialog, SampleEventsDialog } from "./SourceSampleDialogs";

// Карточка источника справа от таблицы — по макету «Источники» (public/images/sources.jpeg)

const iconClass = "size-4 shrink-0 text-ink";

function Card({
  icon,
  title,
  className,
  children,
}: {
  icon: ReactNode;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-[10px] border border-[#e5e7eb] bg-white px-4 pt-3 pb-4",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 text-xs">
      <dt className="w-[45%] shrink-0 text-ink-muted">{label}</dt>
      <dd className="min-w-0 flex-1 break-words text-ink">{children}</dd>
    </div>
  );
}

function Tags({ values }: { values?: string[] }) {
  if (!values?.length) return <>—</>;
  return (
    <span className="flex flex-wrap gap-1">
      {values.map((value) => (
        <SourceTag key={value} className="font-mono font-normal">
          {value}
        </SourceTag>
      ))}
    </span>
  );
}

const HEALTH_STYLES: Record<SourceHealthStatus, { icon: typeof CircleCheck; className: string }> = {
  healthy: { icon: CircleCheck, className: "text-emerald-600" },
  warning: { icon: CircleAlert, className: "text-amber-500" },
  offline: { icon: CircleX, className: "text-rose-600" },
};

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-1 rounded-[10px] border border-[#e5e7eb] px-3 py-2">
      <span className="text-[11px] text-ink-muted">{label}</span>
      <span className="text-lg font-semibold break-words text-ink tabular-nums">{value}</span>
    </div>
  );
}

function MonitoringCard({ source }: { source: SourceType }) {
  const { data: health, isPending, isError, refetch } = useSourceHealth(source.source_id);

  const warning =
    health?.health_warning_after_seconds ??
    source.health_warning_after_seconds ??
    DEFAULT_HEALTH_WARNING_SECONDS;
  const offline =
    health?.health_offline_after_seconds ??
    source.health_offline_after_seconds ??
    DEFAULT_HEALTH_OFFLINE_SECONDS;

  let body: ReactNode;
  if (isPending) {
    body = (
      <div className="grid animate-pulse grid-cols-2 gap-2 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-[62px] rounded-[10px] bg-line-muted" />
        ))}
      </div>
    );
  } else if (isError || !health) {
    body = (
      <div className="flex items-center justify-between gap-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Не удалось получить состояние источника
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Повторить
        </Button>
      </div>
    );
  } else {
    const style = HEALTH_STYLES[health.status as SourceHealthStatus];
    const StatusIcon = style?.icon ?? CircleAlert;
    body = (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
        <div
          className={cn(
            "col-span-2 flex items-center gap-2 rounded-[10px] border border-[#e5e7eb] bg-surface-muted px-3 py-2 sm:col-span-1",
            style?.className ?? "text-ink-muted",
          )}
        >
          <StatusIcon className="size-6 shrink-0" aria-hidden />
          <span className="text-base font-semibold">
            {SOURCE_HEALTH_LABELS[health.status as SourceHealthStatus] ?? health.status}
          </span>
        </div>
        <Metric label="Событий за 5 минут" value={health.events_5m} />
        <Metric label="EPS (5 минут)" value={health.eps_5m.toLocaleString("ru-RU", { maximumFractionDigits: 3 })} />
        <Metric label="Задержка" value={formatSeconds(health.lag_seconds)} />
        <Metric label="Последнее событие" value={<span className="text-sm">{formatSourceDateTime(health.last_event_at)}</span>} />
      </div>
    );
  }

  return (
    <Card icon={<Activity className={iconClass} />} title="Мониторинг (состояние источника)">
      {body}
      <p className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-ink">
        <span className="font-semibold">Пороги состояния:</span>
        <span>
          <span className="text-ink-muted">Предупреждение: </span>
          {formatThreshold(warning)}
        </span>
        <span>
          <span className="text-ink-muted">Недоступен: </span>
          {formatThreshold(offline)}
        </span>
      </p>
    </Card>
  );
}

function SourceContent({ source }: { source: SourceType }) {
  const warning = source.health_warning_after_seconds ?? DEFAULT_HEALTH_WARNING_SECONDS;
  const offline = source.health_offline_after_seconds ?? DEFAULT_HEALTH_OFFLINE_SECONDS;

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-line bg-surface p-2">
      <header className="flex min-h-11 flex-wrap items-center gap-3 rounded-[10px] border border-[#e5e7eb] bg-white py-2 pr-3 pl-3">
        <SourceTag className="bg-[#8fcdf1]/60 px-2.5 text-sm leading-6 font-semibold text-[#1067c2]">
          {source.source_id}
        </SourceTag>
        <h2 className="min-w-0 flex-1 text-base font-semibold break-words text-ink">{source.name}</h2>
        <SourceStatusBadge enabled={source.enabled} />
        <Link
          href={routes.sources}
          scroll={false}
          aria-label="Закрыть карточку источника"
          title="Закрыть"
          className="flex size-7 items-center justify-center rounded-md text-ink hover:bg-surface-muted"
        >
          <X className="size-[18px]" />
        </Link>
      </header>

      <Card icon={<Info className={iconClass} />} title="Описание">
        <p className="text-xs break-words whitespace-pre-line text-ink">{source.description || "—"}</p>
      </Card>

      <MonitoringCard source={source} />

      <div className="grid gap-3 md:grid-cols-2">
        <Card icon={<Boxes className={iconClass} />} title="Тип и продукт">
          <dl className="flex flex-col gap-2">
            <Row label="Тип источника">
              <SourceTag>{getSourceTypeLabel(source.source_type)}</SourceTag>
            </Row>
            <Row label="Производитель">{source.vendor_name || "—"}</Row>
            <Row label="Продукт">{source.product_name || "—"}</Row>
            <Row label="Профиль нормализации">{source.normalization_profile || "—"}</Row>
          </dl>
        </Card>

        <Card icon={<Landmark className={iconClass} />} title="Организация">
          <dl className="flex flex-col gap-2">
            <Row label="Организация">
              {source.organization_id ? (
                <Link
                  href={routes.organization(source.organization_id)}
                  className="text-[#1067c2] hover:underline"
                >
                  {source.organization_id}
                </Link>
              ) : (
                "—"
              )}
            </Row>
          </dl>
        </Card>

        <Card icon={<Database className={iconClass} />} title="Идентификация">
          <dl className="flex flex-col gap-2">
            <Row label="Agent IDs">
              <Tags values={source.agent_ids} />
            </Row>
            <Row label="Agent names">
              <Tags values={source.agent_names} />
            </Row>
            <Row label="Hostnames">
              <Tags values={source.hostnames} />
            </Row>
            <Row label="Locations">
              <Tags values={source.locations} />
            </Row>
            <Row label="Device IPs">
              <Tags values={source.device_ips} />
            </Row>
          </dl>
        </Card>

        <Card icon={<FileText className={iconClass} />} title="Сведения">
          <dl className="flex flex-col gap-2">
            <Row label="ID источника">{source.source_id}</Row>
            <Row label="Включён">
              <SourceTag className={source.enabled ? "bg-[#b7e9ba]" : "bg-[#fde2e2] text-red-700"}>
                {source.enabled ? "Да" : "Нет"}
              </SourceTag>
            </Row>
            <Row label="Пороги (warning / offline)">
              {warning} сек. / {offline} сек.
            </Row>
            <Row label="Создан">{formatSourceDateTime(source.created_at)}</Row>
            <Row label="Изменён">{formatSourceDateTime(source.updated_at)}</Row>
          </dl>
        </Card>
      </div>

      <footer className="flex flex-wrap items-center gap-3 px-1 pt-1 pb-1">
        <SampleEventsDialog sourceId={source.source_id} />
        <DataQualityDialog sourceId={source.source_id} />
        <Link
          href={routes.sourceEdit(source.source_id)}
          className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg border border-brand-light px-3.5 text-sm font-medium text-brand-light transition-colors hover:bg-brand-light/5"
        >
          <SquarePen className="size-4" aria-hidden />
          Редактировать
        </Link>
      </footer>
    </div>
  );
}

export function SourceDetails({ sourceId }: { sourceId: string }) {
  const { data, isPending, isError, refetch } = useSource(sourceId);

  if (isPending) {
    return (
      <div className="flex animate-pulse flex-col gap-3" aria-busy="true">
        <div className="h-11 rounded-[10px] bg-line-muted" />
        <div className="h-16 rounded-[10px] bg-line-muted" />
        <div className="h-32 rounded-[10px] bg-line-muted" />
        <div className="h-40 rounded-[10px] bg-line-muted" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-3 rounded-[10px] border border-[#e5e7eb] bg-white px-4 py-16 text-center">
        <p className="font-semibold text-ink" role="alert">
          {isError ? "Не удалось загрузить источник" : "Источник не найден"}
        </p>
        <div className="flex justify-center gap-2">
          {isError && (
            <Button variant="outline" onClick={() => refetch()}>
              Повторить попытку
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link href={routes.sources}>К списку источников</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <SourceContent source={data} />;
}
