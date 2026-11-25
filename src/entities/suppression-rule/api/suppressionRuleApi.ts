import { axiosApi } from "@/shared/api";
import type {
  MatchFieldResponseType,
  SuppressionRuleCreateType,
  SuppressionRuleCreateUpdateResult,
  SuppressionRuleDeleteResponse,
  SuppressionRuleTestRequest,
  SuppressionRuleTestResponse,
  SuppressionRuleType,
  SuppressionRuleUpdateType,
} from "../model/types";

const path = (suppressionId: string) => `/supersession-rules/${encodeURIComponent(suppressionId)}`;

export async function fetchSuppressionRules() {
  const result = await axiosApi.get<SuppressionRuleType[]>("/supersession-rules/");
  return result.data;
}

export async function fetchSuppressionRule(suppressionId: string) {
  const result = await axiosApi.get<SuppressionRuleType>(path(suppressionId));
  return result.data;
}

/** POST — id правила выдаёт backend */
export async function createSuppressionRule(data: SuppressionRuleCreateType) {
  const result = await axiosApi.post<SuppressionRuleCreateUpdateResult>("/supersession-rules/", data);
  return result.data.rule;
}

export async function updateSuppressionRule({
  suppression_id,
  data,
}: {
  suppression_id: string;
  data: SuppressionRuleUpdateType;
}) {
  const result = await axiosApi.put<SuppressionRuleCreateUpdateResult>(path(suppression_id), data);
  return result.data.rule;
}

export async function patchSuppressionRuleStatus({
  suppression_id,
  enabled,
}: {
  suppression_id: string;
  enabled: boolean;
}) {
  const result = await axiosApi.patch<SuppressionRuleCreateUpdateResult>(
    `${path(suppression_id)}/status`,
    { enabled },
  );
  return result.data.rule;
}

export async function deleteSuppressionRule(suppressionId: string) {
  const result = await axiosApi.delete<SuppressionRuleDeleteResponse>(path(suppressionId));
  return result.data;
}

/** Проверка правила на инциденте без сохранения */
export async function testSuppressionRule(data: SuppressionRuleTestRequest) {
  const result = await axiosApi.post<SuppressionRuleTestResponse>("/supersession-rules/test", data);
  return result.data;
}

export async function fetchSuppressionMatchFields() {
  const result = await axiosApi.get<MatchFieldResponseType>(
    "/supersession-rules/suppression-match-fields",
  );
  return result.data;
}
