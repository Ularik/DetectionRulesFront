"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { inputClass } from "@/shared/ui/form";
import {
  useAgents,
  type OrganizationCreateUpdateType,
} from "@/entities/organization";

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

type Props = {
  title: string;
  backHref: string;
  backLabel: string;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  // Создание блокирует отправку, пока грузятся агенты; редактирование — нет
  blockWhileAgentsLoading?: boolean;
  initialValues?: OrganizationCreateUpdateType;
  onSubmit: (payload: OrganizationCreateUpdateType) => void;
};

// Общая форма создания и редактирования кампании
export function OrganizationForm({
  title,
  backHref,
  backLabel,
  submitLabel,
  pendingLabel,
  isPending,
  blockWhileAgentsLoading = false,
  initialValues,
  onSubmit,
}: Props) {
  const router = useRouter();
  const {
    data: agents = [],
    isPending: isAgentsLoading,
    isError: isAgentsError,
  } = useAgents();

  const [name, setName] = useState(initialValues?.name ?? "");
  const [aliases, setAliases] = useState(
    (initialValues?.aliases ?? []).join(", "),
  );
  const [hostnames, setHostnames] = useState(
    (initialValues?.hostnames ?? []).join(", "),
  );
  const [enabled, setEnabled] = useState(initialValues?.enabled ?? true);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(
    initialValues?.agent_ids ?? [],
  );

  const handleToggleAgent = (agentId: string) => {
    setSelectedAgentIds((current) =>
      current.includes(agentId)
        ? current.filter((id) => id !== agentId)
        : [...current, agentId],
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: OrganizationCreateUpdateType = {
      name: name.trim(),
      aliases: parseList(aliases),
      agent_ids: selectedAgentIds,
      hostnames: parseList(hostnames),
      enabled,
    };

    if (!payload.name) {
      toast.error("Введите название кампании", { position: "top-center" });
      return;
    }

    onSubmit(payload);
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
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          {title}
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-line bg-white p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Название</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              placeholder="Например: SOC-Ukraine"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">
              Псевдонимы
            </span>
            <input
              value={aliases}
              onChange={(event) => setAliases(event.target.value)}
              className={inputClass}
              placeholder="alias1, alias2"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Хосты</span>
          <input
            value={hostnames}
            onChange={(event) => setHostnames(event.target.value)}
            className={inputClass}
            placeholder="host1, host2, host3"
          />
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-ink">Агенты</span>
            <span className="text-xs text-ink-muted">
              {selectedAgentIds.length} выбрано
            </span>
          </div>

          {isAgentsLoading ? (
            <div className="rounded-2xl border border-line bg-surface-muted px-4 py-3 text-sm text-ink-muted">
              Загрузка агентов...
            </div>
          ) : isAgentsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Не удалось загрузить список агентов.
            </div>
          ) : agents.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {agents.map((agent) => {
                const selected = selectedAgentIds.includes(agent.agent_id);

                return (
                  <button
                    key={agent.agent_id}
                    type="button"
                    onClick={() => handleToggleAgent(agent.agent_id)}
                    className={[
                      "flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition",
                      selected
                        ? "border-brand-light bg-brand-soft/40 text-brand"
                        : "border-line bg-white text-ink hover:border-brand-soft",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {agent.agent_name || agent.agent_id}
                      </div>
                      <div className="mt-1 truncate text-xs text-ink-muted">
                        {agent.agent_id}
                      </div>
                    </div>
                    <span
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-md border",
                        selected
                          ? "border-brand bg-brand text-white"
                          : "border-line bg-white text-transparent",
                      ].join(" ")}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-surface-muted px-4 py-3 text-sm text-ink-muted">
              Агентов пока нет.
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface-muted px-4 py-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
          />
          <span className="text-sm font-medium text-ink">
            Кампания активна
          </span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(backHref)}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={isPending || (blockWhileAgentsLoading && isAgentsLoading)}
          >
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
