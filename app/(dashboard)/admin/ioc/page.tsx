"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PaginationControl } from "@/components/pagination/pagination";
import { IocTable } from "@/components/ioc/IocTable";
import { useIoc } from "@/services/ioc/iocQueries";

export default function IocPage() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const { data, isPending, error, refetch } = useIoc({ page, size });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Indicators of Compromise
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Просмотр индикаторов компрометации и их источников
          </p>
        </div>
        <Link
          href="/admin/ioc/new"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
        >
          Добавить IOC
        </Link>
      </div>
      {error ? (
        <div className="space-y-3 py-16 text-center">
          <p className="font-semibold text-[#1E2B6D]">Не удалось загрузить IOC</p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <>
          <div className="my-5">
            <IocTable items={items} isLoading={isPending} limit={size} />
          </div>
          <PaginationControl
            page={page}
            limit={size}
            total={total}
            onPageChange={setPage}
            onLimitChange={(newSize) => {
              setSize(newSize);
              setPage(1);
            }}
            isLoading={isPending}
          />
        </>
      )}
    </div>
  );
}