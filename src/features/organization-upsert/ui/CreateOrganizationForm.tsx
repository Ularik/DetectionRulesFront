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
      title="Создание кампании"
      backHref={routes.organizations}
      backLabel="К списку кампаний"
      submitLabel="Создать кампанию"
      pendingLabel="Создание..."
      isPending={createOrganization.isPending}
      blockWhileAgentsLoading
      onSubmit={(payload) =>
        createOrganization.mutate(payload, {
          onSuccess: () => {
            toast.success("Кампания создана", { position: "top-center" });
            router.push(routes.organizations);
          },
          onError: () => {
            toast.error("Не удалось создать кампанию", {
              position: "top-center",
            });
          },
        })
      }
    />
  );
}
