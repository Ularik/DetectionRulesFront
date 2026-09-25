"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SuppressionRuleTypes } from "@/types/supers"; // Путь к вашему TS интерфейсу

interface SuperRuleDetailsProps {
  rule: SuppressionRuleTypes;
  onStatusToggle?: (enabled: boolean) => void;
  onDelete?: (id: string) => void;
}

export default function SuperRuleDetailsPage({
  rule,
  onStatusToggle,
  onDelete,
}: SuperRuleDetailsProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  // Копирование JSON структуры правила
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(rule, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Бейдж Severity
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
      case "high":
        return "bg-red-50 text-red-700 ring-red-600/20";
      case "medium":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "low":
      default:
        return "bg-blue-50 text-blue-700 ring-blue-600/20";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* 1. Хлебные крошки */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/superrules"
          className="hover:text-indigo-600 transition-colors"
        >
          Super Rules
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-mono font-medium">
          {rule.suppression_id}
        </span>
      </nav>

      {/* 2. Шапка детализации */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              {rule.description}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                rule.enabled
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                  : "bg-gray-100 text-gray-600 ring-gray-500/10"
              }`}
            >
              <span
                className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                  rule.enabled ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
              {rule.enabled ? "Active" : "Disabled"}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            ID:{" "}
            <span className="font-mono text-gray-700">
              {rule.suppression_id}
            </span>
          </p>
        </div>

        {/* Действия со страницей */}
        <div className="flex items-center gap-3">
          <Link
            href={`${pathname}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Редактировать
          </Link>

          {onDelete && (
            <button
              onClick={() => onDelete(rule.suppression_id)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              Удалить
            </button>
          )}
        </div>
      </div>

      {/* 3. Основной контент (Grid Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - Ключевые параметры и Совпадения (2/3 ширины) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Причина создания */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Причина подавления (Reason)
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {rule.reason || "Причина не указана"}
            </p>
          </div>

          {/* Условия совпадения (Match Criteria) */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Условия совпадения (Match Criteria)
            </h2>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="border-b border-gray-100 pb-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Source IP
                </dt>
                <dd className="mt-1 font-mono text-gray-900 font-medium">
                  {rule.match.source_ip || "—"}
                </dd>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Destination IP
                </dt>
                <dd className="mt-1 font-mono text-gray-900 font-medium">
                  {rule.match.destination_ip || "—"}
                </dd>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Dst Port
                </dt>
                <dd className="mt-1 font-mono text-gray-900 font-medium">
                  {rule.match.dst_port ?? "—"}
                </dd>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Attack Type
                </dt>
                <dd className="mt-1 font-mono text-gray-900 font-medium">
                  {rule.match.attack_type || "—"}
                </dd>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Observer Host
                </dt>
                <dd className="mt-1 font-mono text-gray-900 font-medium">
                  {rule.match.observer_host || "—"}
                </dd>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Detection Rule ID
                </dt>
                <dd className="mt-1 font-mono text-gray-900 font-medium">
                  {rule.match.detection_rule_id || "—"}
                </dd>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Category
                </dt>
                <dd className="mt-1 font-mono text-gray-900 font-medium">
                  {rule.match.category || "—"}
                </dd>
              </div>
            </dl>

            {/* Дополнительные списки совпадений */}
            {(rule.match.paths?.length > 0 ||
              rule.match.path_prefixes?.length > 0 ||
              rule.match.contains?.length > 0) && (
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
                {rule.match.paths?.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-2">
                      Paths
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.match.paths.map((p, i) => (
                        <span
                          key={i}
                          className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {rule.match.path_prefixes?.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-2">
                      Path Prefixes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.match.path_prefixes.map((p, i) => (
                        <span
                          key={i}
                          className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {rule.match.contains?.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-2">
                      Contains
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.match.contains.map((value, i) => (
                        <span
                          key={i}
                          className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Детали действия (Action Details) */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Применяемое действие (Action Details)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 mb-4">
              <div>
                <span className="text-xs text-gray-500 block">Mode</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {rule.action.mode}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Action</span>
                <span className="font-semibold text-indigo-600 capitalize">
                  {rule.action.action || rule.action.decision}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Severity</span>
                <span
                  className={`inline-flex items-center mt-0.5 rounded px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${getSeverityBadge(
                    rule.action.severity,
                  )}`}
                >
                  {rule.action.severity.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Risk Score</span>
                <span className="font-semibold text-gray-900">
                  {rule.action.risk_score}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <span className="text-xs text-gray-500 block">Decision</span>
                <span className="font-medium text-gray-900 capitalize">
                  {rule.action.decision}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">
                  Attack Type Override
                </span>
                <span className="font-medium text-gray-900">
                  {rule.action.attack_type || "—"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Suppressed</span>
                <span className="font-medium text-gray-900">
                  {rule.action.suppressed ? "Да" : "Нет"}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="text-gray-500">
                  Причина активации действия:
                </span>{" "}
                <span className="font-medium text-gray-800">
                  {rule.action.suppression_reason}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Правая колонка - Метаданные и Инструменты (1/3 ширины) */}
        <div className="space-y-6">
          {/* Метаданные */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
              Информация о правиле
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-500 block">Теги</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {rule.tags.length > 0 ? (
                    rule.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Нет тегов
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 block">
                  Создано автором
                </span>
                <span className="font-medium text-gray-800">
                  {rule.created_by ? `@${rule.created_by}` : "—"}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-500 block">
                  Обновлено автором
                </span>
                <span className="font-medium text-gray-800">
                  {rule.updated_by ? `@${rule.updated_by}` : "—"}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 block">
                  Дата создания
                </span>
                <span className="text-xs font-mono text-gray-700">
                  {rule.created_at
                    ? new Date(rule.created_at).toLocaleString()
                    : "—"}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-500 block">
                  Дата обновления
                </span>
                <span className="text-xs font-mono text-gray-700">
                  {rule.updated_at
                    ? new Date(rule.updated_at).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* JSON Дамп для копирования */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Raw JSON</h3>
              <button
                onClick={handleCopyJson}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                {copied ? "Скопировано!" : "Скопировать"}
              </button>
            </div>
            <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed scrollbar-thin">
              {JSON.stringify(rule, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
