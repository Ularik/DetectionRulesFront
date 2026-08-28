"use client";

import RuleCard from "@/components/rule/RuleCard";
import { useRules } from "@/services/rules/ruleQueries";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PaginationControl } from "@/components/pagination/pagination";
import { useState } from "react";


export default function DetectionRules() {
  const pathname = usePathname(); 

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const offset = (page - 1) * limit;
  const { isPending, isError, data, error } = useRules({
    limit: limit,
    offset: offset,
  });

  const total = data?.total ?? 0;

  // Обработчик смены размера страницы (сбрасываем на 1-ю страницу)
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <>
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Detection Rules
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Управление и настройка правил обнаружения
          </p>
        </div>
        <Link
          href={`${pathname}/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Добавить правило
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap my-5">
        {data?.items.map((rule) => (
          <RuleCard key={rule.rule_id} rule={rule} />
        ))}
      </div>
      {/* Пагинация */}
      <PaginationControl
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        isLoading={isPending}
      />
    </>
  );
}
