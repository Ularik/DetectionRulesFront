import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CorrelationRuleType } from "@/types/crules";
import axios from "axios";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Props {
  rule: CorrelationRuleType;
}

export default function CRuleCard({ rule }: Props) {
  //   const { mutate } = useDeleteCorrelationRule();

  //   const deleteRule = async (correlationId: string) => {
  //     mutate(correlationId, {
  //       onSuccess: () =>
  //         toast.success("Правило корреляции удалено", { position: "top-center" }),
  //       onError: (error) => {
  //         if (axios.isAxiosError(error) && error.response?.status === 404) {
  //           toast.error("Запись не найдена", { position: "top-center" });
  //         } else {
  //           toast.error("Ошибка удаления", { position: "top-center" });
  //         }
  //       },
  //     });
  //   };

  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Да" : "Нет";
    return String(value ?? "—");
  };

  const {
    correlation_id,
    enabled,
    severity,
    min_unique_categories,
    description,
    scenario_type,
    window_seconds,
    confidence,
    sequence,
    group_by,
    recommendations,
    tags,
    created_by,
    updated_by,
    created_at,
    updated_at,
    ...rest
  } = rule;

  // Поля, которые динамически выводятся в цикле
  const ruleFields = Object.keys(rest) as (keyof typeof rest)[];

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
        <CardAction>
          <button
            aria-label="Удалить"
            type="button"
            onClick={() => console.log("delete")}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </CardAction>
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
              title={formatValue(rest[key])}
            >
              {formatValue(rest[key])}
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
          href={`/admin/crule/${correlation_id}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Открыть детальнее
        </Link>
      </CardFooter>
    </Card>
  );
}
