"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaginationControl } from "@/components/pagination/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEvents } from "@/services/events/eventQueries";
import type { WazuhEvent } from "@/types/events";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function eventKey(event: WazuhEvent, index: number) {
  return (
    event._elastic_id ??
    `${event["@timestamp"] ?? event.timestamp ?? "event"}-${index}`
  );
}

export default function Events() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const query = useEvents({ page, size });

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(1);
  };

  return (
    <section className="space-y-5">
      <header className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          События
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Сырые события мониторинга безопасности
        </p>
      </header>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {query.isError ? (
          <div className="p-6 text-center">
            <p className="text-sm text-red-700" role="alert">
              Не удалось загрузить события.
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
                <TableHead>Время</TableHead>
                <TableHead>Агент / хост</TableHead>
                <TableHead>IP хоста</TableHead>
                <TableHead>Декодер</TableHead>
                <TableHead>Источник журнала</TableHead>
                <TableHead>Событие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isPending ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-gray-500"
                  >
                    Загрузка событий...
                  </TableCell>
                </TableRow>
              ) : query.data?.items.length ? (
                query.data.items.map((event, index) => {
                  const eventId =
                    event._elastic_id;
                  const indexName = event._elastic_index;
                  const detailHref =
                    indexName && eventId
                      ? `/admin/hunters/events/${indexName}/${eventId}`
                      : null;

                  return (
                    <TableRow key={eventKey(event, index)}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(event["@timestamp"] ?? event.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {event.agent?.name ||
                            event.host?.name ||
                            event.host?.hostname ||
                            "—"}
                        </div>
                        {event.agent?.id && (
                          <div className="mt-1 text-xs text-gray-500">
                            Агент {event.agent.id}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {event.host?.ip?.length
                          ? event.host.ip.join(", ")
                          : event.agent?.ip || "—"}
                      </TableCell>
                      <TableCell>{event.decoder?.name || "—"}</TableCell>
                      <TableCell>
                        <div>{event.location || "—"}</div>
                        {event.predecoder?.program_name && (
                          <div className="mt-1 text-xs text-gray-500">
                            {event.predecoder.program_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[520px]">
                        <div className="space-y-2">
                          {event.full_log ? (
                            <details>
                              <summary className="max-w-[440px] cursor-pointer truncate text-sm text-gray-700">
                                {event.full_log}
                              </summary>
                              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-gray-50 p-3 text-xs text-gray-700">
                                {event.full_log}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-gray-400">
                              Нет текста события
                            </span>
                          )}
                          {detailHref && (
                            <Link
                              href={detailHref}
                              className="inline-flex items-center text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
                            >
                              Просмотреть детально
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-gray-500"
                  >
                    События не найдены
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
        total={query.data?.total ?? 0}
        onPageChange={setPage}
        onLimitChange={handleSizeChange}
        isLoading={query.isFetching}
      />
    </section>
  );
}
