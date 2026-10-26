"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { routes } from "@/shared/config";
import { useOrganization } from "@/entities/organization";
import { useUpdateOrganization } from "../model/mutations";
import { OrganizationForm } from "./OrganizationForm";

export function EditOrganizationForm({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const { data: organization, isPending: isOrganizationPending } =
    useOrganization(organizationId);
  const updateOrganization = useUpdateOrganization();

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
    <OrganizationForm
      // Перемонтируем форму при смене организации, чтобы подхватить начальные значения
      key={organization.organization_id}
      title="Редактирование организации"
      backHref={routes.organization(organizationId)}
      backLabel="К деталям организации"
      submitLabel="Сохранить"
      pendingLabel="Сохранение..."
      isPending={updateOrganization.isPending}
      initialValues={{
        name: organization.name ?? "",
        aliases: organization.aliases ?? [],
        agent_ids: organization.agent_ids ?? [],
        hostnames: organization.hostnames ?? [],
        enabled: Boolean(organization.enabled),
      }}
      onSubmit={(payload) =>
        updateOrganization.mutate(
          { organizationId, data: payload },
          {
            onSuccess: () => {
              toast.success("Организация обновлена", {
                position: "top-center",
              });
              router.push(routes.organization(organizationId));
            },
            onError: () => {
              toast.error("Не удалось обновить организацию", {
                position: "top-center",
              });
            },
          },
        )
      }
    />
  );
}
