"use client";

import {
  FileText,
  User,
  Clock,
  ShieldAlert,
  ArrowRight,
  Database,
} from "lucide-react";
import type { AuditType } from "@/types/audits";
import { useRouter } from "next/navigation";


interface AuditTableProps {
  items: AuditType[];
  isLoading?: boolean;
  limit?: number;
}

// Форматирование даты
const formatDate = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

// Бейдж действия
const ActionBadge = ({ action }: { action: string | null }) => {
  const act = action?.toUpperCase() || "UNKNOWN";

  const styles: Record<string, string> = {
    CREATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    UPDATE: "bg-amber-50 text-amber-700 border-amber-200",
    DELETE: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const badgeClass = styles[act] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeClass}`}
    >
      {act}
    </span>
  );
};

export const AuditTable = ({
  items,
  isLoading = false,
  limit = 10,
}: AuditTableProps) => {
    const router = useRouter();


  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-4">
                Дата / Время
              </th>
              <th scope="col" className="px-6 py-4">
                Пользователь
              </th>
              <th scope="col" className="px-6 py-4">
                Действие
              </th>
              <th scope="col" className="px-6 py-4">
                Тип ресурса
              </th>
              <th scope="col" className="px-6 py-4">
                Правило (Rule ID)
              </th>
              <th scope="col" className="px-6 py-4">
                Audit ID
              </th>
              <th scope="col" className="px-6 py-4">
                Изменения (Before → After)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              // Скелетон загрузки
              Array.from({ length: limit }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 rounded-md w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-36"></div>
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              // Пустое состояние
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-gray-300" />
                    <p className="font-medium text-gray-500">
                      Записи аудита не найдены
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Данные
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/80 transition-colors"
                  onClick={() => router.push(`audit/${item.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1E2B6D]/10 text-[#1E2B6D] flex items-center justify-center font-bold text-xs">
                        {item.author?.username?.[0]?.toUpperCase() || (
                          <User className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.author?.username || "Неизвестно"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.author?.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ActionBadge action={item.action} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <Database className="w-4 h-4 text-gray-400" />
                      {item.resource_type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      #{item.rule_unique_id} ({item.rule_general_id})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      Audit ID #{item.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-gray-500 max-w-[100px] truncate"
                        title={item.before_id}
                      >
                        {item.before_id || "null"}
                      </span>
                      <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span
                        className="text-gray-900 font-semibold max-w-[100px] truncate"
                        title={item.after_id}
                      >
                        {item.after_id || "null"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
