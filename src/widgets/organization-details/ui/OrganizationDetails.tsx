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
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-gray-900">
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
      <div className="py-20 text-center text-gray-500">
        Загрузка организации...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4 py-20 text-center">
        <p className="font-semibold text-[#1E2B6D]">
          Не удалось загрузить организацию
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
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1E2B6D]"
      >
        <ArrowLeft className="h-4 w-4" />
        Все организации
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4">
        <header>
          <p className="mb-2 text-sm text-gray-500">Детали организации</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {data.name}
          </h1>
          <p className="mt-2 font-mono text-sm text-gray-500">
            {data.organization_id}
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          <Link
            href={routes.organizationEdit(data.organization_id)}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            Редактировать
          </Link>
          <DeleteOrganizationButton organization={data} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Статус</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {data.enabled ? "Активна" : "Отключена"}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium text-gray-500">
            Количество агентов
          </p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {data.agent_ids?.length ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Псевдонимы</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {data.aliases?.length ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Хосты</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {data.hostnames?.length ?? 0}
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
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

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
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
            <span className="text-sm text-gray-500">Псевдонимы не указаны</span>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Агенты</h2>
        <div className="flex flex-wrap gap-2">
          {data.agent_ids?.length ? (
            data.agent_ids.map((agentId) => (
              <Badge key={agentId} variant="secondary">
                {agentId}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-500">Агенты не назначены</span>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Хосты</h2>
        <div className="flex flex-wrap gap-2">
          {data.hostnames?.length ? (
            data.hostnames.map((hostname) => (
              <Badge key={hostname} variant="outline">
                {hostname}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-500">Хосты не указаны</span>
          )}
        </div>
      </section>
    </div>
  );
}
