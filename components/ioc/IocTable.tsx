"use client";

import Link from "next/link";
import { Eye, ShieldAlert } from "lucide-react";
import type { IocType } from "@/types/ioc";

interface IocTableProps {
  items: IocType[];
  isLoading?: boolean;
  limit?: number;
}

const severityStyles: Record<string, string> = {
  critical: "bg-rose-50 text-rose-700 border-rose-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-sky-50 text-sky-700 border-sky-200",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function IocTable({ items, isLoading = false, limit = 10 }: IocTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm text-gray-600">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">IOC</th>
              <th className="px-6 py-4">Тип</th>
              <th className="px-6 py-4">Угроза</th>
              <th className="px-6 py-4">Критичность</th>
              <th className="px-6 py-4">Источник</th>
              <th className="px-6 py-4">Последнее обнаружение</th>
              <th className="px-6 py-4 text-right"> </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: limit }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <td className="px-6 py-5" key={cellIndex}>
                      <div className="h-4 w-24 rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center text-gray-400">
                  <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  IOC не найдены
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.ioc_id} className="transition-colors hover:bg-gray-50/80">
                  <td className="max-w-[280px] px-6 py-4">
                    <Link
                      href={`/admin/ioc/${item.ioc_id}`}
                      className="block truncate font-mono text-xs font-semibold text-[#1E2B6D] hover:underline"
                      title={item.value}
                    >
                      {item.value}
                    </Link>
                    <div className="mt-1 truncate text-xs text-gray-400">{item.ioc_id}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-700">
                    {item.ioc_type}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">{item.threat_type}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                        severityStyles[item.severity.toLowerCase()] ??
                        "border-gray-200 bg-gray-50 text-gray-700"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-700">{item.source}</div>
                    {item.source_org && <div className="text-xs text-gray-400">{item.source_org}</div>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                    {formatDate(item.last_seen_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/ioc/${item.ioc_id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E2B6D] hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
