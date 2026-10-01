"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControl } from "@/components/pagination/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAttackTypes } from "@/services/attackTypes/attackTypesQueries";
import { useOrganizations } from "@/services/organizations/orgQueries";
import { useScenarios } from "@/services/scenarios/scenariosQueries";
import type { Severity } from "@/types/scenarios";

const severityStyles: Record<Severity, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
};

export default function ScenarioList() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [organizationId, setOrganizationId] = useState("");
  const [attackType, setAttackType] = useState("");
  const organizations = useOrganizations();
  const attackTypes = useAttackTypes();
  const { data, isPending, isError } = useScenarios({
    page,
    size,
    organization_id: organizationId || undefined,
    attack_type: attackType || undefined,
  });

  const handleOrganizationChange = (value: string) => {
    setOrganizationId(value === "all" ? "" : value);
    setPage(1);
  };

  const handleAttackTypeChange = (value: string) => {
    setAttackType(value === "all" ? "" : value);
    setPage(1);
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(1);
  };

  return (
    <section className="space-y-5">
      <header className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Сценарии безопасности
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Обнаруженные сценарии и их текущий статус
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="scenario-organization"
            className="text-sm font-medium"
          >
            Организация
          </label>
          <Select
            value={organizationId || "all"}
            onValueChange={handleOrganizationChange}
            disabled={organizations.isPending || organizations.isError}
          >
            <SelectTrigger
              id="scenario-organization"
              className="w-full bg-white"
            >
              <SelectValue placeholder="Все организации" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все организации</SelectItem>
              {organizations.data?.items.map((organization) => (
                <SelectItem
                  key={organization.organization_id}
                  value={organization.organization_id}
                >
                  {organization.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {organizations.isError && (
            <p className="text-xs text-red-700" role="alert">
              Не удалось загрузить организации
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="scenario-attack-type" className="text-sm font-medium">
            Тип атаки
          </label>
          <Select
            value={attackType || "all"}
            onValueChange={handleAttackTypeChange}
            disabled={attackTypes.isPending || attackTypes.isError}
          >
            <SelectTrigger
              id="scenario-attack-type"
              className="w-full bg-white"
            >
              <SelectValue placeholder="Все типы атак" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы атак</SelectItem>
              {attackTypes.data?.items.map((attack) => (
                <SelectItem key={attack.value} value={attack.value}>
                  {attack.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {attackTypes.isError && (
            <p className="text-xs text-red-700" role="alert">
              Не удалось загрузить типы атак
            </p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isError ? (
          <p className="p-6 text-sm text-red-700" role="alert">
            Не удалось загрузить сценарии. Попробуйте обновить страницу.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>ID сценария</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Серьезность</TableHead>
                <TableHead>Статус аналитика</TableHead>
                <TableHead>Оценка</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Назначение</TableHead>
                <TableHead>Последнее обнаружение</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-gray-500"
                  >
                    Загрузка сценариев...
                  </TableCell>
                </TableRow>
              ) : data?.items.length ? (
                data.items.map((scenario) => (
                  <TableRow key={scenario.scenario_id}>
                    <TableCell className="font-medium">
                      {scenario.scenario_id ? (
                        <Link
                          href={`/admin/hunters/scenarios/${encodeURIComponent(scenario.scenario_id)}`}
                          className="text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          {scenario.scenario_id}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{scenario.scenario_type}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded px-2 py-1 text-xs font-medium capitalize ${scenario.severity ? severityStyles[scenario.severity] : "bg-gray-100 text-gray-600"}`}
                      >
                        {scenario.severity ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>{scenario.analyst_status}</TableCell>
                    <TableCell>{scenario.scenario_score}/100</TableCell>
                    <TableCell>
                      {scenario.source_ip ?? scenario.observer_host}
                    </TableCell>
                    <TableCell>
                      {scenario.destination_ip || scenario.destination_host}
                    </TableCell>
                    <TableCell>{formatDate(scenario.last_seen)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-gray-500"
                  >
                    Сценарии не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <PaginationControl
        page={page}
        limit={size}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onLimitChange={handleSizeChange}
        isLoading={isPending}
      />
    </section>
  );
}
