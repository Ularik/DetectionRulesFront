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
import type { RuleType } from "../model/types";
import { RULE_SEVERITY_STYLES } from "../config/severity";

interface Props {
  rule: RuleType;
  // Действия над правилом (вкл/выкл, удаление) — передаются из widgets/features
  actions?: ReactNode;
}

// Поля, которые не выводятся в общем списке карточки (description рендерится отдельно)
const HIDDEN_FIELDS = new Set<keyof RuleType>([
  "rule_id",
  "enabled",
  "severity_hint",
  "description",
  "explanation_template",
  "recommendations",
  "scenario_type",
  "created_by",
  "updated_by",
  "created_at",
  "updated_at",
]);

export function RuleCard({ rule, actions }: Props) {
  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  };

  const { severity_hint, description } = rule;

  const ruleFields = Object.keys(rule).filter(
    (key) => !HIDDEN_FIELDS.has(key as keyof RuleType),
  );

  return (
    <>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Rule ID: {rule.rule_id}</CardTitle>
          <CardDescription>
            <span className="text-sm truncate block max-w-xs">
              {rule.description}
            </span>
            <Badge
              className={`${RULE_SEVERITY_STYLES[severity_hint]} border-0 font-medium`}
            >
              {severity_hint}
            </Badge>
          </CardDescription>
          {actions && (
            <CardAction className="flex gap-1 items-center">{actions}</CardAction>
          )}
        </CardHeader>
        <CardContent className="h-full">
          {ruleFields.map((key) => (
            <div
              key={key}
              className="grid grid-cols-2 gap-5 mt-2 border-b items-center justify-between"
            >
              <p>{key}</p>
              <p
                className="overflow-hidden text-ellipsis whitespace-nowrap"
                title={formatValue(rule[key as keyof RuleType])}
              >
                {formatValue(rule[key as keyof RuleType])}
              </p>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-5 mt-2 border-b items-center justify-between">
            <p>description</p>
            <p
              className="overflow-hidden whitespace-pre-line line-clamp-3"
              title={description}
            >
              {description}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Link href={routes.rule(rule.rule_id)}>Открыть таблицу</Link>
        </CardFooter>
      </Card>
    </>
  );
}
