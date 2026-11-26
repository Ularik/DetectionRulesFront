"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { PageHeader, pageStackClass } from "@/shared/ui/page-header";
import { PaginationControl } from "@/shared/ui/pagination";
import { IocTable, useIocs } from "@/entities/ioc";
import { routes } from "@/shared/config";

type Props = {
  /** ioc_id открытого IOC: таблица становится компактной, карточка показывается справа */
  selectedId?: string | null;
  /** Карточка IOC — открывается справа от таблицы */
  detail?: ReactNode;
};

export function IocList({ selectedId, detail }: Props) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(15);
  const { data, isPending, isFetching, error, refetch } = useIocs({ page, size });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const compact = Boolean(selectedId);

  return (
    <section className={cn(pageStackClass, "font-(family-name:--font-inter)")}>
      <PageHeader
        title="Threat Intelligence"
        description="Индикаторы компрометации (IOC) из источников threat intelligence"
        actions={
          <Link
            href={routes.iocNew}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-light px-4 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-brand"
          >
            <Plus className="size-4" />
            Добавить IOC
          </Link>
        }
      />

      <div className={cn("grid items-start gap-5", detail && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]")}>
      <div className={cn("min-w-0", detail && "order-2 xl:order-1")}>
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
      </div>
      {detail && (
        <aside className="order-1 xl:sticky xl:top-5 xl:order-2 xl:max-h-[calc(100vh-40px)] xl:overflow-y-auto">
          {detail}
        </aside>
      )}
      </div>
    </section>
  );
}
