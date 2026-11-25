"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import { ChipsInput, Field, SelectBox, Toggle, controlClass, textareaClass } from "@/shared/ui/form";
import { getErrorMessage } from "@/shared/lib/errors";
import { useOrganizations } from "@/entities/organization";
import {
  ASSET_CRITICALITIES,
  ASSET_CRITICALITY_LABELS,
  ASSET_ENVIRONMENTS,
  ASSET_ENVIRONMENT_LABELS,
  ASSET_TYPES,
  ASSET_TYPE_LABELS,
  type Asset,
  type AssetCreateUpdateType,
  type AssetCriticality,
  type AssetEnvironment,
  type AssetType,
} from "@/entities/asset";
import { useCreateAsset, useUpdateAsset } from "../model/mutations";

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6 = /^[0-9a-f:]+$/i;
const isValidIp = (value: string) => IPV4.test(value) || (value.includes(":") && IPV6.test(value));

const toFormValues = (asset?: Asset | null): AssetCreateUpdateType => ({
  organization_id: asset?.organization_id ?? "",
  name: asset?.name ?? "",
  ip: asset?.ip ?? "",
  hostnames: asset?.hostnames ?? [],
  asset_type: asset?.asset_type ?? null,
  criticality: asset?.criticality ?? "medium",
  environment: asset?.environment ?? null,
  tags: asset?.tags ?? [],
  enabled: asset?.enabled ?? true,
  description: asset?.description ?? null,
});

type Errors = Partial<Record<"organization_id" | "name" | "ip", string>>;

function validate(values: AssetCreateUpdateType): Errors {
  const errors: Errors = {};
  if (!values.organization_id) errors.organization_id = "Выберите организацию";
  if (!values.name.trim()) errors.name = "Укажите имя актива";
  if (!values.ip.trim()) errors.ip = "Укажите IP-адрес";
  else if (!isValidIp(values.ip.trim())) errors.ip = "Некорректный IP-адрес";
  return errors;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Актив для редактирования; без него — создание */
  asset?: Asset | null;
};

// Создание и редактирование актива (AssetCreateUpdateSchema) в модальном окне
export function AssetFormDialog({ open, onOpenChange, asset }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto bg-white sm:max-w-2xl">
        {/* key сбрасывает форму при открытии для другого актива */}
        {open && (
          <AssetForm
            key={asset?.asset_id ?? "new"}
            asset={asset}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AssetForm({ asset, onDone }: { asset?: Asset | null; onDone: () => void }) {
  const isEdit = Boolean(asset);
  const [values, setValues] = useState(() => toFormValues(asset));
  const [errors, setErrors] = useState<Errors>({});
  const { data: organizationsData, isPending: organizationsPending } = useOrganizations();
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const isPending = createAsset.isPending || updateAsset.isPending;

  const organizations = organizationsData?.items ?? [];
  // Организации актива может не быть в справочнике — показываем её id, чтобы значение не потерялось
  const hasUnknownOrganization =
    values.organization_id &&
    !organizations.some((organization) => organization.organization_id === values.organization_id);

  const set = <K extends keyof AssetCreateUpdateType>(key: K, value: AssetCreateUpdateType[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const payload: AssetCreateUpdateType = {
      ...values,
      name: values.name.trim(),
      ip: values.ip.trim(),
      description: values.description?.trim() || null,
    };
    const callbacks = {
      onSuccess: () => {
        toast.success(isEdit ? "Актив обновлён" : "Актив добавлен", { position: "top-center" });
        onDone();
      },
      onError: (error: unknown) => {
        toast.error(
          getErrorMessage(error, isEdit ? "Не удалось обновить актив" : "Не удалось добавить актив"),
          { position: "top-center" },
        );
      },
    };

    if (asset) updateAsset.mutate({ assetId: asset.asset_id, data: payload }, callbacks);
    else createAsset.mutate(payload, callbacks);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="space-y-1 pr-8">
        <DialogTitle className="text-ink">{isEdit ? "Редактирование актива" : "Новый актив"}</DialogTitle>
        <DialogDescription className="text-ink-muted">
          {isEdit ? `ID: ${asset?.asset_id}` : "Информационный актив организации и его параметры"}
        </DialogDescription>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Имя актива" required error={errors.name}>
          <input
            value={values.name}
            onChange={(event) => set("name", event.target.value)}
            placeholder="SRV-ERP-01"
            aria-invalid={Boolean(errors.name) || undefined}
            className={controlClass}
          />
        </Field>
        <Field label="IP-адрес" required error={errors.ip}>
          <input
            value={values.ip}
            onChange={(event) => set("ip", event.target.value)}
            placeholder="10.30.5.21"
            aria-invalid={Boolean(errors.ip) || undefined}
            className={controlClass}
          />
        </Field>

        <Field label="Организация" required error={errors.organization_id}>
          <SelectBox
            value={values.organization_id}
            onChange={(value) => set("organization_id", value)}
            invalid={Boolean(errors.organization_id)}
            disabled={organizationsPending}
            ariaLabel="Организация"
          >
            <option value="">{organizationsPending ? "Загрузка..." : "Выберите организацию"}</option>
            {organizations.map((organization) => (
              <option key={organization.organization_id} value={organization.organization_id}>
                {organization.name}
              </option>
            ))}
            {hasUnknownOrganization && (
              <option value={values.organization_id}>{values.organization_id}</option>
            )}
          </SelectBox>
        </Field>
        <Field label="Тип актива">
          <SelectBox
            value={values.asset_type ?? ""}
            onChange={(value) => set("asset_type", (value || null) as AssetType | null)}
            ariaLabel="Тип актива"
          >
            <option value="">Не указан</option>
            {ASSET_TYPES.map((type) => (
              <option key={type} value={type}>
                {ASSET_TYPE_LABELS[type]}
              </option>
            ))}
          </SelectBox>
        </Field>

        <Field label="Критичность">
          <SelectBox
            value={values.criticality}
            onChange={(value) => set("criticality", value as AssetCriticality)}
            ariaLabel="Критичность"
          >
            {ASSET_CRITICALITIES.map((criticality) => (
              <option key={criticality} value={criticality}>
                {ASSET_CRITICALITY_LABELS[criticality]}
              </option>
            ))}
          </SelectBox>
        </Field>
        <Field label="Среда">
          <SelectBox
            value={values.environment ?? ""}
            onChange={(value) => set("environment", (value || null) as AssetEnvironment | null)}
            ariaLabel="Среда"
          >
            <option value="">Не указана</option>
            {ASSET_ENVIRONMENTS.map((environment) => (
              <option key={environment} value={environment}>
                {ASSET_ENVIRONMENT_LABELS[environment]}
              </option>
            ))}
          </SelectBox>
        </Field>

        <Field label="Имена хостов" hint="Enter или запятая — добавить" className="sm:col-span-2">
          <ChipsInput
            values={values.hostnames}
            onChange={(hostnames) => set("hostnames", hostnames)}
            placeholder="srv-erp-01"
            mono
          />
        </Field>
        <Field label="Теги" hint="Enter или запятая — добавить" className="sm:col-span-2">
          <ChipsInput
            values={values.tags}
            onChange={(tags) => set("tags", tags)}
            placeholder="erp, critical"
          />
        </Field>
        <Field label="Описание" className="sm:col-span-2">
          <textarea
            value={values.description ?? ""}
            onChange={(event) => set("description", event.target.value)}
            rows={3}
            className={textareaClass}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-muted pt-4">
        <Toggle
          checked={values.enabled}
          onChange={(enabled) => set("enabled", enabled)}
          label={values.enabled ? "Актив активен" : "Актив неактивен"}
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>
            Отмена
          </Button>
          <Button type="submit" disabled={isPending} className="bg-brand-light hover:bg-brand">
            {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить актив"}
          </Button>
        </div>
      </div>
    </form>
  );
}
