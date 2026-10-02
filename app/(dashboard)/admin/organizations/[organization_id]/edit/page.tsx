"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  useAgents,
  useOrganizationDetail,
  useUpdateOrganization,
} from "@/services/organizations/orgQueries";
import type { OrganizationCreateUpdateType } from "@/types/organizations";

const inputClass =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus-visible:border-[#1E2B6D] focus-visible:ring-2 focus-visible:ring-[#1E2B6D]/20";

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams<{ organization_id: string }>();
  const organizationId = decodeURIComponent(params.organization_id ?? "");

  const { data: organization, isPending: isOrganizationPending } =
    useOrganizationDetail(organizationId);
  const {
    data: agents = [],
    isPending: isAgentsLoading,
    isError: isAgentsError,
  } = useAgents();
  const updateOrganization = useUpdateOrganization();

  const [name, setName] = useState("");
  const [aliases, setAliases] = useState("");
  const [hostnames, setHostnames] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  useEffect(() => {
    if (!organization) return;

    setName(organization.name ?? "");
    setAliases((organization.aliases ?? []).join(", "));
    setHostnames((organization.hostnames ?? []).join(", "));
    setEnabled(Boolean(organization.enabled));
    setSelectedAgentIds(organization.agent_ids ?? []);
  }, [organization]);

  const handleToggleAgent = (agentId: string) => {
    setSelectedAgentIds((current) =>
      current.includes(agentId)
        ? current.filter((id) => id !== agentId)
        : [...current, agentId],
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!organizationId || !name.trim()) {
      toast.error("Введите название организации", { position: "top-center" });
      return;
    }

    const payload: OrganizationCreateUpdateType = {
      name: name.trim(),
      aliases: parseList(aliases),
      agent_ids: selectedAgentIds,
      hostnames: parseList(hostnames),
      enabled,
    };

    updateOrganization.mutate(
      { organizationId, data: payload },
      {
        onSuccess: () => {
          toast.success("Организация обновлена", { position: "top-center" });
          router.push(
            `/admin/organizations/${encodeURIComponent(organizationId)}`,
          );
        },
        onError: () => {
          toast.error("Не удалось обновить организацию", {
            position: "top-center",
          });
        },
      },
    );
  };

  if (isOrganizationPending) {
    return (
      <div className="py-20 text-center text-gray-500">
        Загрузка организации...
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-6 text-center text-red-700">
        Организация не найдена
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-gray-200 pb-4">
        <Link
          href={`/admin/organizations/${encodeURIComponent(organizationId)}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950"
        >
          <ArrowLeft className="h-4 w-4" />К деталям организации
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Редактирование организации
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Название</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              placeholder="Например: SOC-Ukraine"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700">
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
          <span className="text-sm font-medium text-gray-700">Хосты</span>
          <input
            value={hostnames}
            onChange={(event) => setHostnames(event.target.value)}
            className={inputClass}
            placeholder="host1, host2"
          />
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-gray-700">Агенты</span>
            <span className="text-xs text-gray-500">
              {selectedAgentIds.length} выбрано
            </span>
          </div>

          {isAgentsLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
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
                        ? "border-[#1E2B6D] bg-[#EEF2FF] text-[#1E2B6D]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {agent.agent_name || agent.agent_id}
                      </div>
                      <div className="mt-1 truncate text-xs text-gray-500">
                        {agent.agent_id}
                      </div>
                    </div>
                    <span
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-md border",
                        selected
                          ? "border-[#1E2B6D] bg-[#1E2B6D] text-white"
                          : "border-gray-300 bg-white text-transparent",
                      ].join(" ")}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
              Агентов пока нет.
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#1E2B6D] focus:ring-[#1E2B6D]"
          />
          <span className="text-sm font-medium text-gray-700">
            Организация активна
          </span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(
                `/admin/organizations/${encodeURIComponent(organizationId)}`,
              )
            }
          >
            Отмена
          </Button>
          <Button type="submit" disabled={updateOrganization.isPending}>
            {updateOrganization.isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </form>
    </div>
  );
}
