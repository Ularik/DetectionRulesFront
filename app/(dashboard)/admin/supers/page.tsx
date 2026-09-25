"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSupers } from "@/services/supers/queries";
import { PaginationControl } from "@/components/pagination/pagination";
// Импортируйте вашу карточку для SuperRules (если она есть) или используйте нужный компонент
import SuperRuleCard from "@/components/super/SuperRulesCard";

export default function SuperPage() {
  const pathname = usePathname();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const offset = (page - 1) * limit;

  // Передаем параметры пагинации в запрос (если бэкенд их поддерживает)
  const {
    data,
    isPending,
    isError,
    error,
  } = useSupers();
  
  const supers = { items: data, total: data?.length}

  // Получаем общее количество элементов для пагинации
  const total = supers?.total ?? 0;

  // Обработчик смены размера страницы
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <>
      {/* Шапка страницы */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Super Rules
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Управление и настройка супер-правил (подавления / корреляции)
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
          Добавить супер-правило
        </Link>
      </div>

      {/* Обработка состояния ошибки */}
      {isError && (
        <div className="my-5 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          Произошла ошибка при загрузке данных:{" "}
          {error?.message || "Неизвестная ошибка"}
        </div>
      )}

      {/* Список элементов / карточки */}
      <div className="flex gap-3 flex-wrap my-5">
        {/* В зависимости от структуры ответа (supers.items или сразу массив supers) */}
        {supers?.items?.map((rule: any) => (
          <SuperRuleCard key={rule.suppression_id || rule.id} rule={rule} />
        ))}

        {/* Сообщение, если список пуст и загрузка завершена */}
        {!isPending &&
          (!supers?.items || supers.items.length === 0) &&
          !isError && (
            <div className="w-full text-center py-10 text-gray-500">
              Правила не найдены
            </div>
          )}
      </div>

      {/* Элементы управления пагинацией */}
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
