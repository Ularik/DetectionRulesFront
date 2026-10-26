"use client";

import { useState } from "react";
import { RuleCard, useRules } from "@/entities/rule";
import { DeleteRuleButton } from "@/features/rule-delete";
import { ToggleRuleStatusButton } from "@/features/rule-toggle-status";
import { PaginationControl } from "@/shared/ui/pagination";

export function RulesList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const offset = (page - 1) * limit;
  const { isPending, data } = useRules({ limit, offset });

  const total = data?.total ?? 0;

  // Обработчик смены размера страницы (сбрасываем на 1-ю страницу)
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <>
      <div className="flex gap-3 flex-wrap my-5">
        {data?.items.map((rule) => (
          <RuleCard
            key={rule.rule_id}
            rule={rule}
            actions={
              <>
                <ToggleRuleStatusButton rule={rule} />
                <DeleteRuleButton ruleId={rule.rule_id} />
              </>
            }
          />
        ))}
      </div>
      {/* Пагинация */}
      <PaginationControl
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        isLoading={isPending}
      />
    </>
  );
}
