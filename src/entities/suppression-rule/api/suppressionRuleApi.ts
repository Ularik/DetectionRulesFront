import { axiosApi } from "@/shared/api";
import type {
  MatchFieldResponseType,
  SuppressionRuleCreateType,
  SuppressionRuleTypes,
  SuppressionRuleUpdateType,
} from "../model/types";

export async function fetchSuppressionRules() {
  const result = await axiosApi.get<SuppressionRuleTypes[]>(
    "/supersession-rules/",
  );
  return result.data;
}

export async function fetchSuppressionRule(suppressionId: string) {
  const result = await axiosApi.get<SuppressionRuleTypes>(
    `/supersession-rules/${suppressionId}`,
  );
  return result.data;
}

export async function updateSuppressionRule({
  super_id,
  data,
}: {
  super_id: string;
  data: SuppressionRuleUpdateType;
}) {
  const result = await axiosApi.put(`/supersession-rules/${super_id}`, data);
  return result.data;
}

export async function fetchSuppressionMatchFields() {
  const result = await axiosApi.get<MatchFieldResponseType>(
    "/supersession-rules/suppression-match-fields",
  );
  return result.data;
}

export async function createSuppressionRule(data: SuppressionRuleCreateType) {
  const result = await axiosApi.post("/supersession-rules/", data);
  return result.data;
}
