"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useAttackTypes } from "@/entities/attack-type";
import { useOrganizations } from "@/entities/organization";

type Props = {
  organizationId: string;
  attackType: string;
  // Пустая строка — «все значения»
  onOrganizationChange: (organizationId: string) => void;
  onAttackTypeChange: (attackType: string) => void;
};

export function ScenariosFilter({
  organizationId,
  attackType,
  onOrganizationChange,
  onAttackTypeChange,
}: Props) {
  const organizations = useOrganizations();
  const attackTypes = useAttackTypes();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="scenario-organization" className="text-sm font-medium">
          Организация
        </label>
        <Select
          value={organizationId || "all"}
          onValueChange={(value) =>
            onOrganizationChange(value === "all" ? "" : value)
          }
          disabled={organizations.isPending || organizations.isError}
        >
          <SelectTrigger id="scenario-organization" className="w-full bg-white">
            <SelectValue placeholder="Все организации" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все организации</SelectItem>
            {organizations.data?.items.map((organization) => (
              <SelectItem
                key={organization.organization_id}
                value={organization.organization_id}
              >
                {organization.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {organizations.isError && (
          <p className="text-xs text-red-700" role="alert">
            Не удалось загрузить организации
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="scenario-attack-type" className="text-sm font-medium">
          Тип атаки
        </label>
        <Select
          value={attackType || "all"}
          onValueChange={(value) =>
            onAttackTypeChange(value === "all" ? "" : value)
          }
          disabled={attackTypes.isPending || attackTypes.isError}
        >
          <SelectTrigger id="scenario-attack-type" className="w-full bg-white">
            <SelectValue placeholder="Все типы атак" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы атак</SelectItem>
            {attackTypes.data?.items.map((attack) => (
              <SelectItem key={attack.value} value={attack.value}>
                {attack.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {attackTypes.isError && (
          <p className="text-xs text-red-700" role="alert">
            Не удалось загрузить типы атак
          </p>
        )}
      </div>
    </div>
  );
}
