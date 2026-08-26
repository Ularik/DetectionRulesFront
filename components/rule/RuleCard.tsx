import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeleteRule } from "@/services/rules/adminRules/ruleQueries";
import { RuleType } from "@/types";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";


interface Props {
    rule: RuleType
}

export default function RuleCard({ rule }: Props) {
    const { mutate, error: delError } = useDeleteRule();

    const deleteRule = async (rule_id: string) => {
    mutate(rule_id, {
        onSuccess: () =>
        toast.success("Правило удалено", { position: "top-center" }),
        onError: (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            toast.error("Запись не найдена", { position: "top-center" });
        } else {
            toast.error("Ошибка удаления", { position: "top-center" });
        }
        },
    });
    };

    const formatValue = (value: unknown): string => {
        if (Array.isArray(value)) return value.join(", ");
        return String(value);
    };

    const { rule_id, enabled, severity_hint, description, explanation_template, recommendations, scenario_type, created_by, updated_by, created_at, updated_at, ...rest } = rule;

    const ruleFields = Object.keys(rest) as string[];

    const RULE_STATUS_STYLES = {
      info: "bg-blue-100 text-blue-700",
      low: "bg-yellow-100 text-yellow-700",
      medium: "bg-purple-100 text-purple-700",
      critical: "bg-red-100 text-red-700",
      high: "bg-red-100 text-red-700",
    };


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
              className={`${RULE_STATUS_STYLES[severity_hint]} border-0 font-medium`}
            >
              {severity_hint}
            </Badge>
          </CardDescription>
          <CardAction>
            <button
              aria-label="Удалить"
              type="button"
              onClick={() => deleteRule(rule.rule_id)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </CardAction>
        </CardHeader>
        <CardContent className="h-full">
          {ruleFields.map((key, index) => (
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
          <Link href={`${rule.rule_id}`}>
            Открыть таблицу
          </Link>
        </CardFooter>
      </Card>
    </>
  );
}
