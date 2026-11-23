"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { Crosshair, ExternalLink, FileText, Info, Monitor, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { getErrorMessage } from "@/shared/lib/errors";
import { routes } from "@/shared/config";
import {
  getMitreTechniqueStatus,
  MitreStatusBadge,
  useMitreTechnique,
  type MitreTechnique,
} from "@/entities/mitre-technique";

// Вёрстка по панели «Mitre» фрейма «Mirte detail» макета CERT-KG SIEM (Figma 608:10445)

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

function formatDateTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : `${dateTimeFormatter.format(date).replace(",", "")} (UTC)`;
}

// Описание из MITRE приходит в markdown: превращаем [текст](url) в ссылки, остальное — как есть
const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

function renderDescription(text: string) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(MARKDOWN_LINK)) {
    const index = match.index ?? 0;
    parts.push(text.slice(lastIndex, index));
    parts.push(
      <a
        key={index}
        href={match[2]}
        target="_blank"
        rel="noreferrer"
        className="text-[#0965c5] hover:underline"
      >
        {match[1]}
      </a>,
    );
    lastIndex = index + match[0].length;
  }
  parts.push(text.slice(lastIndex));
  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>);
}

function Card({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
}) {
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
      <dt className="shrink-0 text-[11px] font-medium text-[#6b7280] sm:w-[220px]">{label}</dt>
      <dd className="min-w-0 flex-1 font-mono text-[11px] break-all text-[#111827]">{children}</dd>
    </div>
  );
}

const iconClass = "size-4 shrink-0 text-[#111827]";

function TechniqueContent({ technique }: { technique: MitreTechnique }) {
  const status = getMitreTechniqueStatus(technique);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3 rounded-[10px] border border-[#e5e7eb] bg-white py-2 pr-4 pl-3.5">
        <span className="flex h-[27px] min-w-[100px] shrink-0 items-center justify-center rounded-[5px] bg-[#0088ff]/35 px-2 font-semibold text-[#07519e]">
          {technique.mitre_id}
        </span>
        <h1 className="min-w-0 flex-1 font-semibold text-[#111827]">{technique.name}</h1>
        <MitreStatusBadge status={status} className="hidden sm:inline-flex" />
        <Link
          href={routes.mitre}
          scroll={false}
          aria-label="Закрыть карточку техники"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#111827] hover:bg-surface-muted"
        >
          <X className="size-[18px]" />
        </Link>
      </header>

      <Card icon={<Info className={iconClass} />} title="Описание">
        <p className="text-justify text-xs font-medium whitespace-pre-line text-black">
          {technique.description ? renderDescription(technique.description) : "—"}
        </p>
      </Card>

      <section className="flex flex-wrap items-center gap-2 rounded-[10px] border border-[#e5e7eb] bg-white px-4 py-1.5">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[#111827]">
          <Crosshair className={iconClass} />
          Тактика
        </h2>
        {technique.tactics.length ? (
          technique.tactics.map((tactic) => (
            <span
              key={tactic}
              className="rounded-[10px] bg-[#f2f9ff] px-3 py-1 text-sm font-semibold text-[#0965c5]"
            >
              {tactic}
            </span>
          ))
        ) : (
          <span className="text-sm text-ink-muted">—</span>
        )}
      </section>

      <Card icon={<Monitor className={iconClass} />} title="Платформы">
        {technique.platforms.length ? (
          <ul className="flex flex-wrap gap-x-2.5 gap-y-3">
            {technique.platforms.map((platform) => (
              <li
                key={platform}
                className="min-w-[61px] rounded-[10px] bg-brand-light/20 px-4 text-center text-xs font-semibold text-[#595555]"
              >
                {platform}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">—</p>
        )}
      </Card>

      <Card icon={<FileText className={iconClass} />} title="Сведения">
        <dl className="flex flex-col gap-2.5">
          <Row label="Версия">{technique.version || "—"}</Row>
          <Row label="Изменения (MITRE)">{formatDateTime(technique.modified)}</Row>
          <Row label="Синхронизирована с SIEM">{formatDateTime(technique.synced_at)}</Row>
          <Row label="Stix ID">{technique.stix_id || "—"}</Row>
          <Row label="Домен">{technique.domain || "—"}</Row>
          <Row label="Источник URL">{technique.source_url || "—"}</Row>
          <Row label="Подтехника">{String(technique.is_subtechnique)}</Row>
          <Row label="Актуальность">{String(status === "active")}</Row>
        </dl>
        {technique.source_url && (
          <a
            href={technique.source_url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-2 self-start border-t border-[#e5e7eb] pt-3 text-sm font-semibold text-[#0965c5] hover:underline"
          >
            <ExternalLink className="size-4" />
            Открыть в MITRE ATT&CK
          </a>
        )}
      </Card>
    </div>
  );
}

export function MitreTechniqueDetails({ mitreId }: { mitreId: string }) {
  const { data, isPending, error, refetch } = useMitreTechnique(mitreId);

  if (isPending) {
    return (
      <div className="flex animate-pulse flex-col gap-6" aria-busy="true">
        <div className="h-11 rounded-[10px] bg-line-muted" />
        <div className="h-64 rounded-[10px] bg-line-muted" />
        <div className="h-10 rounded-[10px] bg-line-muted" />
        <div className="h-24 rounded-[10px] bg-line-muted" />
        <div className="h-56 rounded-[10px] bg-line-muted" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-3 rounded-[10px] border border-[#e5e7eb] bg-white px-4 py-16 text-center">
        <p className="font-semibold text-ink" role="alert">
          {getErrorMessage(error, `Не удалось загрузить технику ${mitreId}`)}
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
          <Button variant="ghost" asChild>
            <Link href={routes.mitre}>К списку техник</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <TechniqueContent technique={data} />;
}
