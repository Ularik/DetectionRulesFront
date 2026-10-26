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
} from "@/shared/ui/table";
import { PaginationControl } from "@/shared/ui/pagination";
import { routes } from "@/shared/config";
import { SCENARIO_SEVERITY_STYLES, useScenarios } from "@/entities/scenario";
import { ScenariosFilter } from "@/features/scenarios-filter";

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

export function ScenariosList() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [organizationId, setOrganizationId] = useState("");
  const [attackType, setAttackType] = useState("");
  const { data, isPending, isError } = useScenarios({
    page,
    size,
    organization_id: organizationId || undefined,
    attack_type: attackType || undefined,
  });

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

      <ScenariosFilter
        organizationId={organizationId}
        attackType={attackType}
        onOrganizationChange={(value) => {
          setOrganizationId(value);
          setPage(1);
        }}
        onAttackTypeChange={(value) => {
          setAttackType(value);
          setPage(1);
        }}
      />

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
                          href={routes.scenario(scenario.scenario_id)}
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
                        className={`inline-flex rounded px-2 py-1 text-xs font-medium capitalize ${scenario.severity ? SCENARIO_SEVERITY_STYLES[scenario.severity] : "bg-gray-100 text-gray-600"}`}
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
