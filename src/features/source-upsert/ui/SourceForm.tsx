"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { inputClass } from "@/shared/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";
import { useAgents, useOrganizations } from "@/entities/organization";
import {
  DEFAULT_HEALTH_OFFLINE_SECONDS,
  DEFAULT_HEALTH_WARNING_SECONDS,
  type SourceCreateUpdateType,
} from "@/entities/source";

// Типы из макета и уже заведённых источников — подсказки, ввести можно любой
const SOURCE_TYPE_SUGGESTIONS = ["waf", "linux", "windows", "system", "firewall", "ids", "edr", "proxy"];

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const joinList = (values: string[] | undefined) => (values ?? []).join(", ");
const emptyToNull = (value: string) => value.trim() || null;

function Field({
  label,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-4 text-sm font-semibold text-ink">{title}</legend>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

type Props = {
  title: string;
  backHref: string;
  backLabel: string;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  initialValues?: SourceCreateUpdateType;
  onSubmit: (payload: SourceCreateUpdateType) => void;
  /** Доп. действия слева внизу (например, «Удалить» при редактировании) */
  extraActions?: ReactNode;
};

// Общая форма создания и редактирования источника (SourceCreateUpdateSchema)
export function SourceForm({
  title,
  backHref,
  backLabel,
  submitLabel,
  pendingLabel,
  isPending,
  initialValues,
  onSubmit,
  extraActions,
}: Props) {
  const router = useRouter();
  const { data: organizations, isPending: isOrganizationsLoading } = useOrganizations();

  const [name, setName] = useState(initialValues?.name ?? "");
  const [sourceType, setSourceType] = useState(initialValues?.source_type ?? "");
  const [organizationId, setOrganizationId] = useState(initialValues?.organization_id ?? "");
  const [vendorName, setVendorName] = useState(initialValues?.vendor_name ?? "");
  const [productName, setProductName] = useState(initialValues?.product_name ?? "");
  const [normalizationProfile, setNormalizationProfile] = useState(
    initialValues?.normalization_profile ?? "",
  );
  const [agentIds, setAgentIds] = useState<string[]>(initialValues?.agent_ids ?? []);
  const [agentNames, setAgentNames] = useState(joinList(initialValues?.agent_names));
  const [hostnames, setHostnames] = useState(joinList(initialValues?.hostnames));
  const [locations, setLocations] = useState(joinList(initialValues?.locations));
  const [deviceIps, setDeviceIps] = useState(joinList(initialValues?.device_ips));
  const [warningAfter, setWarningAfter] = useState(
    String(initialValues?.health_warning_after_seconds ?? DEFAULT_HEALTH_WARNING_SECONDS),
  );
  const [offlineAfter, setOfflineAfter] = useState(
    String(initialValues?.health_offline_after_seconds ?? DEFAULT_HEALTH_OFFLINE_SECONDS),
  );
  const [enabled, setEnabled] = useState(initialValues?.enabled ?? true);
  const [description, setDescription] = useState(initialValues?.description ?? "");

  // Организация источника может отсутствовать в списке (удалена) — всё равно показываем её
  const organizationOptions = organizations?.items ?? [];
  const {
    data: agents = [],
    isPending: isAgentsLoading,
    isError: isAgentsError,
  } = useAgents();
  // ID агентов источника, которых уже нет в списке Wazuh, — показываем, чтобы их можно было снять
  const unknownAgentIds = isAgentsLoading
    ? []
    : agentIds.filter((id) => !agents.some((agent) => agent.agent_id === id));
  const toggleAgent = (agentId: string) =>
    setAgentIds((current) =>
      current.includes(agentId) ? current.filter((id) => id !== agentId) : [...current, agentId],
    );

  const hasUnknownOrganization =
    Boolean(organizationId) &&
    !isOrganizationsLoading &&
    !organizationOptions.some((organization) => organization.organization_id === organizationId);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const warning = Number(warningAfter);
    const offline = Number(offlineAfter);

    if (!name.trim()) {
      toast.error("Введите название источника", { position: "top-center" });
      return;
    }
    if (!sourceType.trim()) {
      toast.error("Укажите тип источника", { position: "top-center" });
      return;
    }
    if (!Number.isInteger(warning) || warning < 1 || !Number.isInteger(offline) || offline < 1) {
      toast.error("Пороги состояния — целые числа больше 0", { position: "top-center" });
      return;
    }
    if (offline <= warning) {
      toast.error("Порог «Недоступен» должен быть больше порога предупреждения", {
        position: "top-center",
      });
      return;
    }

    onSubmit({
      organization_id: organizationId || null,
      name: name.trim(),
      source_type: sourceType.trim().toLowerCase(),
      vendor_name: emptyToNull(vendorName),
      product_name: emptyToNull(productName),
      normalization_profile: emptyToNull(normalizationProfile),
      agent_ids: agentIds,
      agent_names: parseList(agentNames),
      hostnames: parseList(hostnames),
      locations: parseList(locations),
      device_ips: parseList(deviceIps),
      health_warning_after_seconds: warning,
      health_offline_after_seconds: offline,
      enabled,
      description: emptyToNull(description),
    });
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4">
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-brand-light"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <h1 className="text-2xl leading-8 font-semibold text-ink">{title}</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-line bg-white p-6">
        <FormSection title="Основное">
          <Field label="Название" required>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              placeholder="Например: IRP Linux Source"
              required
            />
          </Field>

          <Field label="Тип источника" required hint="Например: waf, linux, system">
            <input
              value={sourceType}
              onChange={(event) => setSourceType(event.target.value)}
              className={inputClass}
              list="source-type-suggestions"
              placeholder="linux"
              required
            />
            <datalist id="source-type-suggestions">
              {SOURCE_TYPE_SUGGESTIONS.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </Field>

          <Field label="Организация">
            <select
              value={organizationId}
              onChange={(event) => setOrganizationId(event.target.value)}
              className={inputClass}
              disabled={isOrganizationsLoading}
            >
              <option value="">{isOrganizationsLoading ? "Загрузка..." : "Без организации"}</option>
              {hasUnknownOrganization && <option value={organizationId}>{organizationId}</option>}
              {organizationOptions.map((organization) => (
                <option key={organization.organization_id} value={organization.organization_id}>
                  {organization.name} ({organization.organization_id})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Описание" className="md:row-span-2">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={cn(inputClass, "min-h-[96px] resize-y")}
              placeholder="Кратко: что за источник и откуда события"
            />
          </Field>

          <label className="flex items-center gap-3 self-end rounded-2xl border border-line bg-surface-muted px-4 py-3">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
            />
            <span className="text-sm font-medium text-ink">Источник активен</span>
          </label>
        </FormSection>

        <FormSection title="Тип и продукт">
          <Field label="Производитель">
            <input
              value={vendorName}
              onChange={(event) => setVendorName(event.target.value)}
              className={inputClass}
              placeholder="Linux"
            />
          </Field>
          <Field label="Продукт">
            <input
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              className={inputClass}
              placeholder="journald"
            />
          </Field>
          <Field label="Профиль нормализации">
            <input
              value={normalizationProfile}
              onChange={(event) => setNormalizationProfile(event.target.value)}
              className={inputClass}
              placeholder="generic_waf"
            />
          </Field>
        </FormSection>

        <FormSection title="Идентификация (значения через запятую)">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">Agent IDs</span>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(inputClass, "flex items-center justify-between gap-2 text-left")}
                  disabled={isAgentsLoading}
                >
                  <span className={cn("truncate", !agentIds.length && "text-ink-muted")}>
                    {isAgentsLoading
                      ? "Загрузка..."
                      : agentIds.length
                        ? agentIds.join(", ")
                        : "Выберите агентов"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="max-h-72 w-(--radix-popover-trigger-width) overflow-y-auto p-1"
              >
                {isAgentsError && (
                  <div className="px-3 py-2 text-sm text-red-600">
                    Не удалось загрузить список агентов.
                  </div>
                )}
                {!isAgentsError && !agents.length && !unknownAgentIds.length && (
                  <div className="px-3 py-2 text-sm text-ink-muted">Агентов пока нет.</div>
                )}
                {[
                  ...unknownAgentIds.map((id) => ({ agent_id: id, agent_name: "" })),
                  ...agents,
                ].map((agent) => {
                  const selected = agentIds.includes(agent.agent_id);
                  return (
                    <button
                      key={agent.agent_id}
                      type="button"
                      onClick={() => toggleAgent(agent.agent_id)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-muted"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          selected
                            ? "border-brand bg-brand text-white"
                            : "border-line bg-white text-transparent",
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{agent.agent_id}</span>
                        {agent.agent_name && (
                          <span className="block truncate text-xs text-ink-muted">
                            {agent.agent_name}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </PopoverContent>
            </Popover>
          </div>
          <Field label="Agent names">
            <input
              value={agentNames}
              onChange={(event) => setAgentNames(event.target.value)}
              className={inputClass}
              placeholder="irp, web-01"
            />
          </Field>
          <Field label="Hostnames">
            <input
              value={hostnames}
              onChange={(event) => setHostnames(event.target.value)}
              className={inputClass}
              placeholder="host1, host2"
            />
          </Field>
          <Field label="Locations">
            <input
              value={locations}
              onChange={(event) => setLocations(event.target.value)}
              className={inputClass}
              placeholder="journald, /var/log/syslog"
            />
          </Field>
          <Field label="Device IPs">
            <input
              value={deviceIps}
              onChange={(event) => setDeviceIps(event.target.value)}
              className={inputClass}
              placeholder="192.0.2.10"
            />
          </Field>
        </FormSection>

        <FormSection title="Пороги состояния">
          <Field label="Предупреждение, сек." hint="Нет событий дольше — статус Warning">
            <input
              type="number"
              min={1}
              step={1}
              value={warningAfter}
              onChange={(event) => setWarningAfter(event.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Недоступен, сек." hint="Нет событий дольше — статус Offline">
            <input
              type="number"
              min={1}
              step={1}
              value={offlineAfter}
              onChange={(event) => setOfflineAfter(event.target.value)}
              className={inputClass}
              required
            />
          </Field>
        </FormSection>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-muted pt-5">
          <div>{extraActions}</div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => router.push(backHref)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? pendingLabel : submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
