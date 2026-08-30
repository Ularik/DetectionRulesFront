"use client";

import { useAuditDetail } from "@/services/audits/auditsQueries";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Loader2, User } from "lucide-react";
import { RuleDetailTable } from "@/components/rule/RuleDetail/RuleDetail"; // ваш компонент из прошлого сообщения

const actionLabels: Record<string, { label: string; className: string }> = {
  created: {
    label: "Создано",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  updated: {
    label: "Обновлено",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  deleted: {
    label: "Удалено",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

function formatDate(value: string | Date) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditDetail() {
  const { id } = useParams();
  const router = useRouter();

  const {
    data: auditDetail,
    isLoading,
    isError,
  } = useAuditDetail(id as string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !auditDetail) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-sm text-muted-foreground">
        Не удалось загрузить историю действия
      </div>
    );
  }

  const action = actionLabels[auditDetail.action ?? ""] ?? {
    label: auditDetail.action ?? "—",
    className: "bg-muted text-muted-foreground border-muted",
  };

  const goTo = (auditId: string) => {
    if (auditId === null) return;
    router.push(`${auditId}`);
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-6 py-6">
      {/* Шапка с инфой о действии */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">
              Действие #{auditDetail.id}
            </h1>
            <Badge variant="outline" className={action.className}>
              {action.label}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {auditDetail.author?.username ?? auditDetail.author_id}
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-muted-foreground">Правило</span>
            <span className="font-medium text-gray-900">
              {auditDetail.rule_general_id}
            </span>

            <span className="text-muted-foreground">Тип ресурса</span>
            <span className="font-medium text-gray-900">
              {auditDetail.resource_type}
            </span>

            <span className="text-muted-foreground">Дата</span>
            <span className="font-medium text-gray-900">
              {formatDate(auditDetail.created_at)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Навигация по истории (before_id / after_id) */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={auditDetail.before_id === null}
          onClick={() => goTo(auditDetail.before_id)}
          className="rounded-xl"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Предыдущее действие
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={auditDetail.after_id === null}
          onClick={() => goTo(auditDetail.after_id)}
          className="rounded-xl"
        >
          Следующее действие
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <Separator />

      {/* Состояние правила на момент этого действия */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Состояние правила
        </h2>
        <RuleDetailTable rule={auditDetail.rule} />
      </div>
    </div>
  );
}
