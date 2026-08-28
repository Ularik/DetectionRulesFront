"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { PaginationControl } from "@/components/pagination/pagination";
import { useAudits } from "@/services/audits/auditsQueries";
import { AuditTable } from "@/components/audit/AuditTable";

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const offset = (page - 1) * limit;

  const { data: audits, isPending } = useAudits({
    limit,
    offset,
  });

  const total = audits?.total ?? 0;
  const auditList = audits?.items ?? [];

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      {/* Заголовок страницы */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#1E2B6D]" />
            История действий (Аудит)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Логирование изменений, действий пользователей и системных событий
          </p>
        </div>
      </div>

      {/* Переиспользуемый компонент таблицы */}
      <AuditTable items={auditList} isLoading={isPending} limit={limit} />

      {/* Пагинация */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white rounded-xl shadow-sm">
        <PaginationControl
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
          isLoading={isPending}
        />
      </div>
    </div>
  );
}
