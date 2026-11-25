"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Database, FileText, Info, ShieldAlert, Tags, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { getErrorMessage } from "@/shared/lib/errors";
import { routes } from "@/shared/config";
import { IocSeverityLabel, useIoc, type IocType } from "@/entities/ioc";
import { MarkIocViewedButton } from "@/features/ioc-mark-viewed";

// Карточка IOC в стиле панели техники MITRE ATT&CK (Figma 608:10445): открывается справа от таблицы

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date).replace(",", "");
}

function show(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-[10px] border border-[#e5e7eb] bg-white p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-sm font-normal text-ink-muted sm:w-[200px]">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm font-normal break-all text-ink">{children}</dd>
    </div>
  );
}

const iconClass = "size-4 shrink-0 text-[#111827]";

function IocContent({ ioc }: { ioc: IocType }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3 rounded-[10px] border border-[#e5e7eb] bg-white py-2 pr-4 pl-3.5">
        <span className="flex h-[27px] min-w-[80px] shrink-0 items-center justify-center rounded-[5px] bg-[#0088ff]/35 px-2 text-sm font-semibold text-[#07519e]">
          {ioc.ioc_type}
        </span>
        <h1 className="min-w-0 flex-1 text-sm font-semibold break-all text-[#1067c2]">{ioc.value}</h1>
        <IocSeverityLabel severity={ioc.severity} className="hidden shrink-0 text-sm sm:flex" />
        <MarkIocViewedButton iocId={ioc.ioc_id} viewed={ioc.viewed} />
        <Link
          href={routes.ioc}
          scroll={false}
          aria-label="Закрыть карточку IOC"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#111827] hover:bg-surface-muted"
        >
          <X className="size-[18px]" />
        </Link>
      </header>

      <Card icon={<ShieldAlert className={iconClass} />} title="Угроза">
        <dl className="flex flex-col gap-2.5">
          <Row label="Тип угрозы">{show(ioc.threat_type)}</Row>
          <Row label="Критичность">{show(ioc.severity)}</Row>
          <Row label="Уверенность">{show(ioc.confidence)}</Row>
          <Row label="To IDS">{ioc.to_ids ? "Да" : "Нет"}</Row>
        </dl>
      </Card>

      <Card icon={<Info className={iconClass} />} title="Описание">
        <p className="text-justify text-sm font-normal whitespace-pre-line text-ink">
          {show(ioc.description)}
        </p>
      </Card>

      <Card icon={<Tags className={iconClass} />} title="Теги">
        {ioc.tags.length ? (
          <ul className="flex flex-wrap gap-x-2.5 gap-y-2">
            {ioc.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-[10px] bg-brand-light/20 px-3 text-xs font-semibold text-[#595555]"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">—</p>
        )}
      </Card>

      <Card icon={<Database className={iconClass} />} title="Источник">
        <dl className="flex flex-col gap-2.5">
          <Row label="Источник">{show(ioc.source)}</Row>
          <Row label="Организация-источник">{show(ioc.source_org)}</Row>
          <Row label="MISP Event ID">{show(ioc.misp_event_id)}</Row>
          <Row label="MISP Event UUID">{show(ioc.misp_event_uuid)}</Row>
          <Row label="MISP Attribute ID">{show(ioc.misp_attribute_id)}</Row>
          <Row label="MISP Attribute UUID">{show(ioc.misp_attribute_uuid)}</Row>
        </dl>
      </Card>

      <Card icon={<FileText className={iconClass} />} title="Сведения">
        <dl className="flex flex-col gap-2.5">
          <Row label="IOC ID">{ioc.ioc_id}</Row>
          <Row label="Последнее обнаружение">{formatDateTime(ioc.last_seen_at)}</Row>
          <Row label="Получено">{formatDateTime(ioc.received_at)}</Row>
          <Row label="Просмотрено">{ioc.viewed ? "Да" : "Нет"}</Row>
          <Row label="Дата просмотра">{formatDateTime(ioc.viewed_at)}</Row>
          <Row label="Просмотрел">{show(ioc.viewed_by)}</Row>
        </dl>
      </Card>
    </div>
  );
}

export function IocDetails({ iocId }: { iocId: string }) {
  const { data: ioc, isPending, error, refetch } = useIoc(iocId);

  if (isPending) {
    return (
      <div className="flex animate-pulse flex-col gap-6" aria-busy="true">
        <div className="h-11 rounded-[10px] bg-line-muted" />
        <div className="h-32 rounded-[10px] bg-line-muted" />
        <div className="h-24 rounded-[10px] bg-line-muted" />
        <div className="h-48 rounded-[10px] bg-line-muted" />
      </div>
    );
  }

  if (error || !ioc) {
    return (
      <div className="space-y-3 rounded-[10px] border border-[#e5e7eb] bg-white px-4 py-16 text-center">
        <p className="font-semibold text-ink" role="alert">
          {error ? getErrorMessage(error, "Не удалось загрузить IOC") : "IOC не найден"}
        </p>
        <div className="flex justify-center gap-2">
          {error && (
            <Button variant="outline" onClick={() => refetch()}>
              Повторить попытку
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link href={routes.ioc}>К списку IOC</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <IocContent ioc={ioc} />;
}
