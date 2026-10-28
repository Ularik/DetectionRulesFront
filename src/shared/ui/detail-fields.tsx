import type { ReactNode } from "react";

// Строительные блоки детальных страниц: подпись + значение, список значений, секция

export function DetailField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-gray-900">
        {value ?? "—"}
      </dd>
    </div>
  );
}

export function DetailFieldList({
  label,
  values,
}: {
  label: string;
  values: Array<string | number> | null | undefined;
}) {
  const items = values?.filter((value) => value !== "" && value !== null) ?? [];

  return (
    <DetailField label={label} value={items.length ? items.join(", ") : "—"} />
  );
}

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}
