import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { routes } from "@/shared/config";
import Link from "next/link";
import type { ReactNode } from "react";
import type { CorrelationRuleType } from "../model/types";

interface Props {
  rule: CorrelationRuleType;
  // Действия над правилом — передаются из widgets/features
  actions?: ReactNode;
}

// Поля, которые выводятся явно или скрыты в карточке
const KNOWN_FIELDS = new Set<string>([
  "correlation_id",
  "enabled",
  "severity",
  "min_unique_categories",
  "description",
  "scenario_type",
  "window_seconds",
  "confidence",
  "sequence",
  "group_by",
  "recommendations",
  "tags",
  "created_by",
  "updated_by",
  "created_at",
  "updated_at",
]);

export function CorrelationRuleCard({ rule, actions }: Props) {
  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Да" : "Нет";
    return String(value ?? "—");
  };

  const {
    correlation_id,
    enabled,
    severity,
    description,
    scenario_type,
    window_seconds,
    confidence,
    sequence,
    group_by,
    tags,
  } = rule;

  // Поля сверх известных (если backend прислал лишнее) выводятся в цикле
  const extraFields = rule as unknown as Record<string, unknown>;
  const ruleFields = Object.keys(rule).filter((key) => !KNOWN_FIELDS.has(key));

  const SEVERITY_STYLES: Record<string, string> = {
    info: "bg-blue-100 text-blue-700",
    low: "bg-yellow-100 text-yellow-700",
    medium: "bg-purple-100 text-purple-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };

  const severityKey = (severity ?? "").toLowerCase();
  const badgeStyle =
    SEVERITY_STYLES[severityKey] || "bg-gray-100 text-gray-700";

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="truncate">Correlation ID: {correlation_id}</span>
          <Badge
            className={
              enabled
                ? "bg-green-100 text-green-700 border-0"
                : "bg-gray-100 text-gray-600 border-0"
            }
          >
            {enabled ? "Активно" : "Отключено"}
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center justify-between pt-1">
          <span className="text-sm truncate block max-w-xs">{description}</span>
          <Badge className={`${badgeStyle} border-0 font-medium`}>
            {severity}
          </Badge>
        </CardDescription>
        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>

      <CardContent className="h-full space-y-2">
        <div className="grid grid-cols-2 gap-5 border-b pb-1 items-center justify-between">
          <p className="text-gray-500 text-sm">Сценарий</p>
          <p className="font-medium text-right truncate" title={scenario_type}>
            {scenario_type}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 border-b pb-1 items-center justify-between">
          <p className="text-gray-500 text-sm">Окно (сек)</p>
          <p className="font-medium text-right">{window_seconds}s</p>
        </div>

        <div className="grid grid-cols-2 gap-5 border-b pb-1 items-center justify-between">
          <p className="text-gray-500 text-sm">Уверенность</p>
          <p className="font-medium text-right">{confidence}%</p>
        </div>

        <div className="grid grid-cols-2 gap-5 border-b pb-1 items-center justify-between">
          <p className="text-gray-500 text-sm">Группировка</p>
          <p
            className="font-medium text-right truncate"
            title={formatValue(group_by)}
          >
            {formatValue(group_by)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 border-b pb-1 items-center justify-between">
          <p className="text-gray-500 text-sm">Последовательность</p>
          <p
            className="font-medium text-right truncate"
            title={formatValue(sequence)}
          >
            {formatValue(sequence)}
          </p>
        </div>

        {tags && tags.length > 0 && (
          <div className="grid grid-cols-2 gap-5 border-b pb-1 items-center justify-between">
            <p className="text-gray-500 text-sm">Теги</p>
            <div className="flex flex-wrap justify-end gap-1 max-h-12 overflow-hidden">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Вывод остальных динамических полей (если есть) */}
        {ruleFields.map((key) => (
          <div
            key={String(key)}
            className="grid grid-cols-2 gap-5 border-b pb-1 items-center justify-between"
          >
            <p className="text-gray-500 text-sm">{String(key)}</p>
            <p
              className="overflow-hidden text-ellipsis whitespace-nowrap text-right"
              title={formatValue(extraFields[key])}
            >
              {formatValue(extraFields[key])}
            </p>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-5 pt-1 border-b pb-1 items-center justify-between">
          <p className="text-gray-500 text-sm">Описание</p>
          <p
            className="overflow-hidden whitespace-pre-line line-clamp-2 text-right text-sm"
            title={description ?? undefined}
          >
            {description}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-2 pt-2">
        <Link
          href={routes.correlationRule(correlation_id)}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Открыть детальнее
        </Link>
      </CardFooter>
    </Card>
  );
}
