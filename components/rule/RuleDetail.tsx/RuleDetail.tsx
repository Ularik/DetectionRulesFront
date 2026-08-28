"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RuleType } from "@/types";
import { Trash2, Edit2, Check, X, RefreshCw, Loader2 } from "lucide-react";

interface RuleTableProps {
  rule: RuleType;
  onDelete?: (ruleId: string) => void;
  onUpdate?: (data: RuleType) => Promise<void> | void;
  onRefresh?: () => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
  isRefreshing?: boolean;
}

export function RuleDetailTable({
  rule,
  onDelete,
  onUpdate,
  onRefresh,
  isDeleting = false,
  isUpdating = false,
  isRefreshing = false,
}: RuleTableProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) return value.join(", ");
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const startEditing = (key: string, currentValue: unknown) => {
    setEditingKey(key);
    setEditValue(formatValue(currentValue));
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditValue("");
  };

  const saveEditing = async (key: string) => {
    if (!onUpdate) return;

    const originalValue = rule[key as keyof RuleType];
    let parsedValue: unknown = editValue;

    if (Array.isArray(originalValue)) {
      parsedValue = editValue.split(",").map((item) => item.trim());
    }

    const updatedRule = {
      ...rule,
      [key]: parsedValue,
    };

    await onUpdate(updatedRule);
    setEditingKey(null);

  };

  const keys = Object.keys(rule) as (keyof RuleType)[];

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden bg-white max-w-[900px] relative">
      {/* Шапка таблицы */}
      <div className="px-6 py-4 bg-muted/40 border-b flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {rule.rule_id}
          </h2>
          {rule.description && (
            <p className="text-sm text-muted-foreground">{rule.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              disabled={isRefreshing || isUpdating || isDeleting}
              onClick={onRefresh}
              title="Обновить данные"
              className="h-9 w-9 rounded-xl border-gray-200"
            >
              <RefreshCw
                className={`h-4 w-4 text-gray-600 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="outline"
              size="icon"
              disabled={isDeleting || isUpdating || isRefreshing}
              onClick={() => onDelete(String(rule.rule_id))}
              title="Удалить правило"
              className="h-9 w-9 rounded-xl border-gray-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Таблица полей и значений */}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[200px] text-center font-semibold">
              Поле
            </TableHead>
            <TableHead className="font-semibold">Значение</TableHead>
            {onUpdate && (
              <TableHead className="w-[100px] text-center font-semibold">
                Действия
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => {
            const isEditingThis = editingKey === key;
            const rawValue = rule[key];
            const displayValue = formatValue(rawValue);

            return (
              <TableRow key={String(key)} className="hover:bg-muted/20">
                <TableCell className="font-medium text-muted-foreground text-sm text-center border-r">
                  {String(key)}
                </TableCell>
                <TableCell className="max-w-[400px]">
                  {isEditingThis ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      disabled={isUpdating}
                      className="h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isUpdating) {
                          saveEditing(String(key));
                        } else if (e.key === "Escape" && !isUpdating) {
                          cancelEditing();
                        }
                      }}
                    />
                  ) : (
                    <div
                      className="whitespace-pre-line text-sm text-gray-800"
                      title={displayValue}
                    >
                      {displayValue}
                    </div>
                  )}
                </TableCell>
                {onUpdate && (
                  <TableCell className="text-center">
                    {isEditingThis ? (
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={isUpdating}
                          onClick={() => saveEditing(String(key))}
                          className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={isUpdating}
                          onClick={cancelEditing}
                          className="h-7 w-7 text-gray-500 hover:bg-gray-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={isUpdating || isDeleting || isRefreshing}
                        onClick={() => startEditing(String(key), rawValue)}
                        className="h-7 w-7 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
