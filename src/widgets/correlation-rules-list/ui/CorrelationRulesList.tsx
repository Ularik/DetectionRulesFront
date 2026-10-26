"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { routes } from "@/shared/config";
import {
  CorrelationRuleCard,
  useCorrelationRules,
} from "@/entities/correlation-rule";

export function CorrelationRulesList() {
  const { data: crules = [] } = useCorrelationRules();

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
          href={routes.correlationRuleNew}
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
        {crules?.map((crule) => (
          <CorrelationRuleCard
            key={crule.correlation_id}
            rule={crule}
            actions={
              // TODO: удаление ещё не реализовано на backend — кнопка-заглушка
              <button
                aria-label="Удалить"
                type="button"
                onClick={() => console.log("delete")}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            }
          />
        ))}
      </div>
    </>
  );
}
