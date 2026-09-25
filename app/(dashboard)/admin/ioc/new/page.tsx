"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePostIoc } from "@/services/ioc/iocQueries";
import type { IocCreateType } from "@/types/ioc";

const inputClass =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus-visible:border-[#1E2B6D] focus-visible:ring-2 focus-visible:ring-[#1E2B6D]/20";

export default function NewIocPage() {
  const router = useRouter();
  const { mutate, isPending } = usePostIoc();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IocCreateType>({
    defaultValues: {
      ioc_type: "",
      value: "",
    },
  });

  const onSubmit = (data: IocCreateType) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("IOC создан", { position: "top-center" });
        router.push("/admin/ioc");
      },
      onError: () => {
        toast.error("Не удалось создать IOC", { position: "top-center" });
      },
    });
  };

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/ioc"
        className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1E2B6D]"
      >
        <ArrowLeft className="h-4 w-4" />
        Все IOC
      </Link>
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Создание IOC
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Добавьте новый индикатор компрометации
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
        autoComplete="off"
      >
        <div className="space-y-2">
          <label htmlFor="ioc_type" className="text-sm font-medium text-gray-700">
            Тип IOC
          </label>
          <Input
            id="ioc_type"
            placeholder="Например, ip, domain или hash"
            {...register("ioc_type", { required: "Введите тип IOC" })}
            className={`${inputClass} ${errors.ioc_type ? "border-red-500" : ""}`}
            disabled={isPending}
          />
          {errors.ioc_type && (
            <p className="text-xs text-red-600">{errors.ioc_type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="value" className="text-sm font-medium text-gray-700">
            Значение
          </label>
          <Input
            id="value"
            placeholder="Введите значение индикатора"
            {...register("value", { required: "Введите значение IOC" })}
            className={`${inputClass} ${errors.value ? "border-red-500" : ""}`}
            disabled={isPending}
          />
          {errors.value && (
            <p className="text-xs text-red-600">{errors.value.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
            Отмена
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Создать IOC
          </Button>
        </div>
      </form>
    </div>
  );
}
