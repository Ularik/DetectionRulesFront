import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import {
  UseFormRegister,
} from "react-hook-form";


export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-semibold text-red-500 pt-0.5">{message}</p>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-[#1E2B6D] uppercase tracking-wider pt-2 border-t border-gray-100">
      {children}
    </h3>
  );
}

export default function ArrayField({
  label,
  fieldItems,
  inputClass,
  errorClass,
  register,
  append,
  remove,
  errors,
  name,
  isPending,
  addLabel = "Добавить",
}: {
  label: string;
  fieldItems: { id: string }[];
  inputClass?: string;
  errorClass?: string;
  register: UseFormRegister<any>;
  append: (v: string) => void;
  remove: (i: number) => void;
  errors: Array<{ message?: string } | undefined>;
  name: string;
  isPending: boolean;
  addLabel?: string;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="space-y-2">
        {fieldItems.map((field, index) => (
          <div key={field.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <Input
                {...register(`${name}.${index}` as never, {
                  required: "Поле не может быть пустым",
                })}
                className={`${inputClass} ${errors[index] ? errorClass : ""}`}
                disabled={isPending}
              />
              <button
                aria-label="Удалить"
                type="button"
                onClick={() => remove(index)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <FieldError message={errors[index]?.message} />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => append("")}
        className="inline-flex items-center justify-center rounded-xl text-sm font-semibold border border-gray-200 text-[#1E2B6D] bg-transparent hover:bg-gray-50 h-10 px-4 w-full transition-colors"
      >
        <Plus className="mr-2 h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}
