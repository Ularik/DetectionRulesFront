"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIocDetail } from "@/services/ioc/iocQueries";

const labels: Record<string, string> = {
  ioc_id: "IOC ID",
  ioc_type: "Тип IOC",
  value: "Значение",
  threat_type: "Тип угрозы",
  severity: "Критичность",
  confidence: "Уверенность",
  source: "Источник",
  source_org: "Организация-источник",
  description: "Описание",
  tags: "Теги",
  misp_event_id: "MISP Event ID",
  misp_event_uuid: "MISP Event UUID",
  misp_attribute_id: "MISP Attribute ID",
  misp_attribute_uuid: "MISP Attribute UUID",
  to_ids: "To IDS",
  last_seen_at: "Последнее обнаружение",
  received_at: "Получено",
  viewed: "Просмотрено",
  viewed_at: "Дата просмотра",
  viewed_by: "Просмотрел",
};

const formatValue = (key: string, value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "boolean") return value ? "Да" : "Нет";
  if (key.endsWith("_at")) {
    return new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(String(value)));
  }
  return String(value);
};


export default function IocDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: ioc, isPending, error, refetch } = useIocDetail(id);

  if (isPending) {
    return <div className="py-20 text-center text-gray-500">Загрузка IOC...</div>;
  }
  if (error) {
    return (
      <div className="space-y-4 py-20 text-center">
        <p className="font-semibold text-[#1E2B6D]">Не удалось загрузить IOC</p>
        <Button variant="outline" onClick={() => refetch()}>
          Повторить попытку
        </Button>
      </div>
    );
  }
  if (!ioc) return <div className="py-20 text-center text-gray-500">IOC не найден</div>;

  return (
    <div>
      <Link
        href="/admin/ioc"
        className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1E2B6D]"
      >
        <ArrowLeft className="h-4 w-4" /> Все IOC
      </Link>
      <div className="mb-5 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Детали IOC</h1>
        <p className="mt-1 break-all font-mono text-sm text-gray-500">{ioc.value}</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-gray-100">
            {Object.keys(labels).map((key) => (
              <tr key={key} className="hover:bg-gray-50/80">
                <td className="w-64 bg-gray-50 px-6 py-4 font-medium text-gray-500">
                  {labels[key]}
                </td>
                <td className="break-all px-6 py-4 text-gray-900">
                  {formatValue(key, ioc[key as keyof typeof ioc])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
