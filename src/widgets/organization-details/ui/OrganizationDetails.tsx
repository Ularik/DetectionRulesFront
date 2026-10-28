"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { routes } from "@/shared/config";
import { useOrganization } from "@/entities/organization";
import { DeleteOrganizationButton } from "@/features/organization-delete";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-ink-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-ink">
        {value ?? "—"}
      </dd>
    </div>
  );
}

export function OrganizationDetails({
  organizationId,
}: {
  organizationId: string;
}) {
  const { data, isPending, isError, refetch } =
    useOrganization(organizationId);

  if (isPending) {
    return (
      <div className="py-20 text-center text-ink-muted">
        Загрузка кампании...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4 py-20 text-center">
        <p className="font-semibold text-ink">
          Не удалось загрузить кампанию
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Повторить попытку
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={routes.organizations}
        className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-brand-light"
      >
        <ArrowLeft className="h-4 w-4" />
        Все кампании
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
        <header>
          <p className="mb-2 text-sm text-ink-muted">Детали кампании</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            {data.name}
          </h1>
          <p className="mt-2 font-mono text-sm text-ink-muted">
            {data.organization_id}
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          <Link
            href={routes.organizationEdit(data.organization_id)}
            className="inline-flex items-center rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
          >
            Редактировать
          </Link>
          <DeleteOrganizationButton organization={data} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white px-4 py-3">
          <p className="text-xs font-medium text-ink-muted">Статус</p>
          <p className="mt-1 text-lg font-semibold text-ink">
            {data.enabled ? "Активна" : "Отключена"}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white px-4 py-3">
          <p className="text-xs font-medium text-ink-muted">
            Количество агентов
          </p>
          <p className="mt-1 text-lg font-semibold text-ink">
            {data.agent_ids?.length ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white px-4 py-3">
          <p className="text-xs font-medium text-ink-muted">Псевдонимы</p>
          <p className="mt-1 text-lg font-semibold text-ink">
            {data.aliases?.length ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white px-4 py-3">
          <p className="text-xs font-medium text-ink-muted">Хосты</p>
          <p className="mt-1 text-lg font-semibold text-ink">
            {data.hostnames?.length ?? 0}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">
          Основные данные
        </h2>
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Название" value={data.name} />
          <Field label="ID" value={data.organization_id} />
          <Field
            label="Статус"
            value={data.enabled ? "Активна" : "Отключена"}
          />
        </dl>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">
          Псевдонимы
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.aliases?.length ? (
            data.aliases.map((alias) => (
              <Badge key={alias} variant="outline">
                {alias}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-ink-muted">Псевдонимы не указаны</span>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">Агенты</h2>
        <div className="flex flex-wrap gap-2">
          {data.agent_ids?.length ? (
            data.agent_ids.map((agentId) => (
              <Badge key={agentId} variant="secondary">
                {agentId}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-ink-muted">Агенты не назначены</span>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">Хосты</h2>
        <div className="flex flex-wrap gap-2">
          {data.hostnames?.length ? (
            data.hostnames.map((hostname) => (
              <Badge key={hostname} variant="outline">
                {hostname}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-ink-muted">Хосты не указаны</span>
          )}
        </div>
      </section>
    </div>
  );
}
