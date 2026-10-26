"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useMitreTechniques,
  useSyncMitre,
} from "@/services/mitre/mitreQueries";

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const responseData: unknown = error.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (responseData && typeof responseData === "object") {
      const data = responseData as Record<string, unknown>;
      for (const key of ["detail", "message", "error"]) {
        const message = data[key];
        if (typeof message === "string" && message.trim()) return message;
      }
    }

    if (!error.response && error.message) return error.message;
    return fallback;
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "—";

  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(date);
}

export default function MitreTechniques() {
  const [search, setSearch] = useState("");
  const query = useMitreTechniques();
  const sync = useSyncMitre();
  const normalizedSearch = search.trim().toLocaleLowerCase("ru-RU");
  const techniques = (query.data ?? []).filter((technique) =>
    [
      technique.mitre_id,
      technique.name,
      technique.description,
      ...technique.tactics,
      ...technique.platforms,
    ]
      .join(" ")
      .toLocaleLowerCase("ru-RU")
      .includes(normalizedSearch),
  );

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            MITRE ATT&CK
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Техники и тактики матрицы MITRE ATT&CK
          </p>
        </div>
        <Button
          onClick={() => sync.mutate()}
          disabled={sync.isPending}
          aria-label="Синхронизировать MITRE ATT&CK"
        >
          <RefreshCw
            aria-hidden="true"
            className={`h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`}
          />
          {sync.isPending ? "Синхронизация..." : "Синхронизировать"}
        </Button>
      </header>

      {sync.isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700" role="alert">
            {getErrorMessage(
              sync.error,
              "Не удалось синхронизировать MITRE ATT&CK.",
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
          >
            Повторить
          </Button>
        </div>
      )}
      {sync.isSuccess && sync.data.success && (
        <p className="text-sm text-emerald-700" role="status">
          Синхронизация завершена. Обработано: {sync.data.received}, добавлено в
          индекс: {sync.data.indexed}.
        </p>
      )}
      {sync.isSuccess && !sync.data.success && (
        <p className="text-sm text-red-700" role="alert">
          Сервер сообщил, что синхронизация MITRE ATT&CK не завершилась.
        </p>
      )}

      <label className="relative block max-w-lg">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по ID, названию, тактике или платформе"
          aria-label="Поиск техник MITRE"
          className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </label>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {query.isError ? (
          <div className="p-6 text-center">
            <p className="text-sm text-red-700" role="alert">
              {getErrorMessage(
                query.error,
                "Не удалось загрузить техники MITRE ATT&CK.",
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => query.refetch()}
            >
              Повторить попытку
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>ID</TableHead>
                <TableHead>Техника</TableHead>
                <TableHead>Тактики</TableHead>
                <TableHead>Платформы</TableHead>
                <TableHead>Домен</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Изменена</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isPending ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-gray-500"
                  >
                    Загрузка техник...
                  </TableCell>
                </TableRow>
              ) : techniques.length ? (
                techniques.map((technique) => {
                  const status = technique.revoked
                    ? "Отозвана"
                    : technique.deprecated
                      ? "Устарела"
                      : "Активна";

                  return (
                    <TableRow key={technique.mitre_id}>
                      <TableCell className="whitespace-nowrap font-mono text-xs font-semibold text-indigo-700">
                        {technique.mitre_id}
                      </TableCell>
                      <TableCell className="min-w-64 whitespace-normal">
                        <div className="font-medium text-gray-900">
                          {technique.name}
                          {technique.is_subtechnique && (
                            <span className="ml-2 text-xs font-normal text-gray-500">
                              Подтехника
                            </span>
                          )}
                        </div>
                        {technique.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                            {technique.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="min-w-48 whitespace-normal">
                        {technique.tactics.length
                          ? technique.tactics.join(", ")
                          : "—"}
                      </TableCell>
                      <TableCell className="min-w-40 whitespace-normal">
                        {technique.platforms.length
                          ? technique.platforms.join(", ")
                          : "—"}
                      </TableCell>
                      <TableCell>{technique.domain || "—"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                            technique.revoked || technique.deprecated
                              ? "border-amber-200 bg-amber-50 text-amber-800"
                              : "border-emerald-200 bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {status}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(technique.modified)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-gray-500"
                  >
                    {search
                      ? "По запросу ничего не найдено"
                      : "Техники MITRE не найдены"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {!query.isPending && !query.isError && (
        <p className="text-xs text-gray-500">
          Показано: {techniques.length} из {query.data?.length ?? 0}
        </p>
      )}
    </section>
  );
}
