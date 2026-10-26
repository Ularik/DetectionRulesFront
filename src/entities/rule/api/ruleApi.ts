import { axiosApi } from "@/shared/api";
import type {
  QueryFiltersType,
  RuleApiResponse,
  RuleCreateUpdateType,
  RuleStatusPatchType,
  RuleType,
} from "../model/types";

export const fetchRules = async (filters: QueryFiltersType) => {
  const result = await axiosApi.get<RuleApiResponse>("/rules/", {
    params: filters,
  });
  return result.data;
};

export const fetchRule = async (rule_id: string) => {
  const result = await axiosApi.get<RuleType>(`/rules/${rule_id}`);
  return result.data;
};

export const fetchSeverityHints = async () => {
  const result = await axiosApi.get<string[]>("/rules/enums/severity-hints");
  return result.data;
};

export const createRule = async (data: RuleCreateUpdateType) => {
  const result = await axiosApi.post<RuleType>("/rules/admin/", data);
  return result.data;
};

export const deleteRule = async (rule_id: string) => {
  await axiosApi.delete(`/rules/admin/${rule_id}`);
};

export async function updateRule({
  rule_id,
  data,
}: {
  rule_id: string;
  data: RuleCreateUpdateType;
}): Promise<RuleType> {
  const result = await axiosApi.put<RuleType>(`/rules/admin/${rule_id}`, data);
  return result.data;
}

export async function patchRuleStatus({
  rule_id,
  data,
}: {
  rule_id: string;
  data: RuleStatusPatchType;
}): Promise<RuleType> {
  const result = await axiosApi.patch<RuleType>(`/rules/admin/${rule_id}`, data);
  return result.data;
}
