"use client";


import Link from "next/link";
import { useParams } from "next/navigation";
import SuperRuleDetailsPage from "@/components/super/SuperRule";
import { useSuperById } from "@/services/supers/queries";


export default function SuperPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: rule, isPending, isError, error } = useSuperById(slug);

  // 1. Состояние загрузки (Skeleton)
  if (isPending) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded"></div>
        <div className="flex justify-between items-center pb-6 border-b border-gray-200">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-80 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // 2. Состояние ошибки при запросе к API
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto my-10 p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 space-y-3">
        <h2 className="text-lg font-semibold">Ошибка при загрузке правила</h2>
        <p className="text-sm">
          {error?.message ||
            "Произошла неизвестная ошибка при получении данных."}
        </p>
        <Link
          href="/superrules"
          className="inline-block text-sm font-semibold text-red-800 underline hover:no-underline"
        >
          ← Вернуться к списку правил
        </Link>
      </div>
    );
  }

  // 3. Если данные пришли, но объект пуст
  if (!rule) {
    return (
      <div className="max-w-7xl mx-auto my-10 p-6 text-center space-y-3">
        <h2 className="text-xl font-bold text-gray-800">Правило не найдено</h2>
        <p className="text-sm text-gray-500">
          Правило с идентификатором <span className="font-mono">{slug}</span> не
          существует или было удалено.
        </p>
        <Link
          href="/superrules"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Вернуться к списку
        </Link>
      </div>
    );
  }

  // 4. Успешный рендер
  return <SuperRuleDetailsPage rule={rule} />;
}
