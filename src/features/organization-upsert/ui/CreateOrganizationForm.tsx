"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { routes } from "@/shared/config";
import { useCreateOrganization } from "../model/mutations";
import { OrganizationForm } from "./OrganizationForm";

export function CreateOrganizationForm() {
  const router = useRouter();
  const createOrganization = useCreateOrganization();

  return (
    <OrganizationForm
      title="Создание организации"
      backHref={routes.organizations}
      backLabel="К списку организаций"
      submitLabel="Создать организацию"
      pendingLabel="Создание..."
      isPending={createOrganization.isPending}
      blockWhileAgentsLoading
      onSubmit={(payload) =>
        createOrganization.mutate(payload, {
          onSuccess: () => {
            toast.success("Организация создана", { position: "top-center" });
            router.push(routes.organizations);
          },
          onError: () => {
            toast.error("Не удалось создать организацию", {
              position: "top-center",
            });
          },
        })
      }
    />
  );
}
