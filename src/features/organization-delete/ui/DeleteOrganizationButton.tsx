"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { routes } from "@/shared/config";
import type { Organization } from "@/entities/organization";
import { useDeleteOrganization } from "../model/useDeleteOrganization";

export function DeleteOrganizationButton({
  organization,
}: {
  organization: Pick<Organization, "organization_id" | "name">;
}) {
  const router = useRouter();
  const deleteOrganization = useDeleteOrganization();

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Удалить организацию "${organization.name}"?`,
    );

    if (!confirmed) return;

    deleteOrganization.mutate(organization.organization_id, {
      onSuccess: () => {
        toast.success("Организация удалена", { position: "top-center" });
        router.push(routes.organizations);
      },
      onError: () => {
        toast.error("Не удалось удалить организацию", {
          position: "top-center",
        });
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleteOrganization.isPending}
      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" />
      {deleteOrganization.isPending ? "Удаление..." : "Удалить"}
    </button>
  );
}
