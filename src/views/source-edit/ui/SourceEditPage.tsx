"use client";

// Клиентский: передаёт в форму render-функцию для кнопки удаления
import { DeleteSourceButton } from "@/features/source-delete";
import { EditSourceForm } from "@/features/source-upsert";

export function SourceEditPage({ sourceId }: { sourceId: string }) {
  return (
    <EditSourceForm
      sourceId={sourceId}
      renderExtraActions={(source) => <DeleteSourceButton source={source} />}
    />
  );
}
