"use client";

import Link from "next/link";
import { SuppressionRuleTypes } from "@/types/supers"; // Путь к вашему TS интерфейсу

interface SuperRuleCardProps {
  rule: SuppressionRuleTypes;
}

export default function SuperRuleCard({ rule }: SuperRuleCardProps) {
  // Цветовая индикация в зависимости от уровня суровости (severity)
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
    <Link
      href={`supers/${rule.suppression_id}`}
      className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md"
    >
      <div className="flex flex-col justify-between transition-all">
        <div>
          {/* Шапка карточки: Статус, ID и кнопка действий */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
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

              <span className="text-xs font-mono font-medium text-gray-500 truncate">
                {rule.suppression_id}
              </span>
            </div>

            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getSeverityBadge(
                rule.action.severity,
              )}`}
            >
              {rule.action.severity.toUpperCase()}
            </span>
          </div>

          {/* Описание и Причина */}
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
              {rule.description}
            </h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {rule.reason}
            </p>
          </div>

          {/* Теги */}
          {rule.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {rule.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Детали совпадения (Match Rules) */}
          <div className="rounded-lg bg-gray-50 p-3 mb-4 text-xs space-y-1.5 border border-gray-100">
            <div className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">
              Match Criteria
            </div>
            {rule.match.source_ip && (
              <div className="flex justify-between">
                <span className="text-gray-500">Source IP:</span>
                <span className="font-mono text-gray-800">
                  {rule.match.source_ip}
                </span>
              </div>
            )}
            {rule.match.attack_type && (
              <div className="flex justify-between">
                <span className="text-gray-500">Attack Type:</span>
                <span className="font-mono text-gray-800">
                  {rule.match.attack_type}
                </span>
              </div>
            )}
            {rule.match.destination_ip && (
              <div className="flex justify-between">
                <span className="text-gray-500">Destination IP:</span>
                <span className="font-mono text-gray-800">
                  {rule.match.destination_ip}
                </span>
              </div>
            )}
            {rule.match.dst_port !== null &&
              rule.match.dst_port !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Dst Port:</span>
                  <span className="font-mono text-gray-800">
                    {rule.match.dst_port}
                  </span>
                </div>
              )}
            {rule.match.observer_host && (
              <div className="flex justify-between">
                <span className="text-gray-500">Observer Host:</span>
                <span className="font-mono text-gray-800">
                  {rule.match.observer_host}
                </span>
              </div>
            )}
            {rule.match.category && (
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-mono text-gray-800">
                  {rule.match.category}
                </span>
              </div>
            )}
            {rule.match.detection_rule_id && (
              <div className="flex justify-between">
                <span className="text-gray-500">Detection Rule ID:</span>
                <span className="font-mono text-gray-800">
                  {rule.match.detection_rule_id}
                </span>
              </div>
            )}
            {!rule.match.source_ip &&
              !rule.match.attack_type &&
              !rule.match.destination_ip &&
              (rule.match.dst_port === null ||
                rule.match.dst_port === undefined) &&
              !rule.match.observer_host &&
              !rule.match.category &&
              !rule.match.detection_rule_id && (
                <span className="text-gray-400 italic">
                  No specific match rules specified
                </span>
              )}
          </div>
        </div>

        {/* Футер: Действие правила и Автор */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-700">Action:</span>
            <span className="capitalize font-semibold text-indigo-600">
              {rule.action.action || rule.action.decision}
            </span>
            <span className="text-gray-300">•</span>
            <span>Risk: {rule.action.risk_score}</span>
          </div>

          {rule.created_by && (
            <span
              className="text-gray-400 truncate max-w-[100px]"
              title={rule.created_by}
            >
              by @{rule.created_by}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
