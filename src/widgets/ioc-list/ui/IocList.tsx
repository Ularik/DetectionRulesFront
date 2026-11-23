"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PaginationControl } from "@/shared/ui/pagination";
import { IocTable, useIocs } from "@/entities/ioc";
import { routes } from "@/shared/config";

type Props = {
  /** ioc_id открытого IOC: таблица становится компактной, карточка показывается справа */
  selectedId?: string | null;
};

export function IocList({ selectedId }: Props) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(15);
  const { data, isPending, isFetching, error, refetch } = useIocs({ page, size });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const compact = Boolean(selectedId);

  return (
    <section className="flex min-w-0 flex-col gap-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink">Threat Intelligence</h1>
        <Link
          href={routes.iocNew}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
        >
          <Plus className="size-4" />
          Добавить IOC
        </Link>
      </div>

      {error ? (
        <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
          <p className="font-semibold text-ink">Не удалось загрузить IOC</p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.04)]">
          <IocTable items={items} isLoading={isPending} limit={size} selectedId={selectedId} />
          <PaginationControl
            page={page}
            limit={size}
            total={total}
            onPageChange={setPage}
            onLimitChange={
              compact
                ? undefined
                : (newSize) => {
                    setSize(newSize);
                    setPage(1);
                  }
            }
            pageSizeOptions={[15, 30, 50, 100]}
            isLoading={isFetching}
            itemsLabel="IOC"
            className="bg-surface-muted px-4 py-3"
          />
        </div>
      )}
    </section>
  );
}
