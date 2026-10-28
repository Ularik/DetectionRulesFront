import Link from "next/link";
import { RulesList } from "@/widgets/rules-list";
import { routes } from "@/shared/config";

export function RulesPage() {
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
          href={routes.ruleNew}
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

      <RulesList />
    </>
  );
}
