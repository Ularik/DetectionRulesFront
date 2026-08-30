"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RuleType } from "@/types/rules";
import { Trash2 } from "lucide-react";
import { useDeleteRule } from "@/services/rules/adminRules/ruleQueries";
import { toast } from "sonner";
import axios from "axios";

interface Props {
  rule: RuleType;
}

export default function RuleTable({ rule }: Props) {
  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  };

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

  return (
    <div className="">
      <div className="mx-4 my-6 rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-muted/50 border-b flex justify-between">
          <div>
            <h2 className="text-lg font-semibold">{rule.rule_id}</h2>
            <p className="text-sm text-muted-foreground">{rule.description}</p>
          </div>
          <button
            aria-label="Удалить"
            type="button"
            onClick={() => deleteRule(rule.rule_id)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px] bg-muted/30">Поле</TableHead>
              <TableHead className="bg-muted/30">Значение</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(Object.keys(rule) as string[]).map((key, i) => (
              <TableRow key={i} className="hover:bg-muted/20">
                <TableCell className="font-medium text-muted-foreground text-sm">
                  {key}
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <div
                    className="overflow-hidden text-ellipsis whitespace-nowrap"
                    title={formatValue(rule[key as keyof RuleType])}
                  >
                    {formatValue(rule[key as keyof RuleType])}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
