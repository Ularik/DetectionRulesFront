"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Building2, FileText, Info, Monitor, MonitorCheck, SquarePen, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { routes } from "@/shared/config";
import {
  OrganizationStatusBadge,
  OrganizationTag,
  useOrganization,
  type Organization,
} from "@/entities/organization";

// Панель организации справа от таблицы — фрейм «ORG Detail» макета CERT-KG SIEM (Figma 648:12495)

function Card({
  icon,
  title,
  children,
  inline = false,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  /** заголовок и содержимое в одну строку (блок «Псевдонимы») */
  inline?: boolean;
}) {
  return (
    <section
      className={
        inline
          ? "flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[10px] border border-[#e5e7eb] bg-white px-4 py-1.5"
          : "flex flex-col gap-3 rounded-[10px] border border-[#e5e7eb] bg-white px-4 pt-2 pb-4"
      }
    >
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
    <div className="flex gap-4 text-[11px]">
      <dt className="w-[45%] shrink-0 font-medium text-[#6b7280]">{label}</dt>
      <dd className="min-w-0 flex-1 font-mono break-words text-ink">{children}</dd>
    </div>
  );
}

const iconClass = "size-[18px] shrink-0 text-[#111827]";

function Empty() {
  return <p className="text-sm text-ink-muted">—</p>;
}

function OrganizationContent({ organization }: { organization: Organization }) {
  const agentNames = organization.agent_names ?? [];
  const agentIds = organization.agent_ids ?? [];
  const agentCount = Math.max(agentNames.length, agentIds.length);

  return (
    <div className="rounded-[10px] border border-line bg-surface px-[5px] py-2.5">
      <div className="flex flex-col gap-9 bg-white">
        <header className="flex min-h-11 items-center gap-3 rounded-[10px] border border-[#e5e7eb] bg-white py-2 pr-4 pl-3.5">
          <span className="flex size-[27px] shrink-0 items-center justify-center rounded-md bg-[#8fcdf1]/60 text-[#1067c2]">
            <Building2 className="size-[18px]" aria-hidden />
          </span>
          <h1 className="min-w-0 flex-1 text-base font-semibold break-words text-ink">
            {organization.name}
          </h1>
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href={routes.organizationEdit(organization.organization_id)}
              aria-label="Редактировать организацию"
              title="Редактировать"
              className="flex size-6 items-center justify-center rounded-md text-[#111827] hover:bg-surface-muted"
            >
              <SquarePen className="size-[18px]" />
            </Link>
            <Link
              href={routes.organizations}
              scroll={false}
              aria-label="Закрыть карточку организации"
              title="Закрыть"
              className="flex size-6 items-center justify-center rounded-md text-[#111827] hover:bg-surface-muted"
            >
              <X className="size-[18px]" />
            </Link>
          </div>
        </header>

        <Card icon={<Info className="size-4 shrink-0 text-[#111827]" />} title="Основная информация">
          <dl className="flex flex-col gap-2.5">
            <Row label="ID организации">{organization.organization_id}</Row>
            <Row label="Наименование">{organization.name}</Row>
            <Row label="Статус">
              <OrganizationStatusBadge
                enabled={organization.enabled}
                className="w-auto px-1.5 font-sans text-[11px] leading-[13px]"
              />
            </Row>
          </dl>
        </Card>

        <Card icon={<FileText className={iconClass} />} title="Псевдонимы" inline>
          {organization.aliases?.length ? (
            <div className="flex flex-wrap gap-2.5">
              {organization.aliases.map((alias) => (
                <OrganizationTag key={alias} className="min-w-[93px]">
                  {alias}
                </OrganizationTag>
              ))}
            </div>
          ) : (
            <Empty />
          )}
        </Card>

        <Card icon={<MonitorCheck className={iconClass} />} title="Агенты">
          {agentCount ? (
            <ul className="flex flex-col gap-3">
              {Array.from({ length: agentCount }).map((_, index) => (
                <li
                  key={agentIds[index] ?? agentNames[index] ?? index}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[#6b7280]/40 bg-white py-0.5 pr-[3px] pl-2.5"
                >
                  <span className="min-w-0 truncate text-sm text-ink">
                    {agentNames[index] ?? "—"}
                  </span>
                  {agentIds[index] && (
                    <OrganizationTag className="shrink-0 font-medium text-black">
                      ID: {agentIds[index]}
                    </OrganizationTag>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Empty />
          )}
        </Card>

        <Card icon={<Monitor className={iconClass} />} title="Хосты">
          {organization.hostnames?.length ? (
            <div className="flex flex-wrap gap-2.5">
              {organization.hostnames.map((hostname) => (
                <OrganizationTag key={hostname} className="min-w-[93px]">
                  {hostname}
                </OrganizationTag>
              ))}
            </div>
          ) : (
            <Empty />
          )}
        </Card>
      </div>
    </div>
  );
}

export function OrganizationDetails({ organizationId }: { organizationId: string }) {
  const { data, isPending, isError, refetch } = useOrganization(organizationId);

  if (isPending) {
    return (
      <div className="flex animate-pulse flex-col gap-6" aria-busy="true">
        <div className="h-11 rounded-[10px] bg-line-muted" />
        <div className="h-28 rounded-[10px] bg-line-muted" />
        <div className="h-10 rounded-[10px] bg-line-muted" />
        <div className="h-32 rounded-[10px] bg-line-muted" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-3 rounded-[10px] border border-[#e5e7eb] bg-white px-4 py-16 text-center">
        <p className="font-semibold text-ink" role="alert">
          {isError ? "Не удалось загрузить организацию" : "Организация не найдена"}
        </p>
        <div className="flex justify-center gap-2">
          {isError && (
            <Button variant="outline" onClick={() => refetch()}>
              Повторить попытку
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link href={routes.organizations}>К списку организаций</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <OrganizationContent organization={data} />;
}
