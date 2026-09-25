import axiosApi from "@/lib/axiosAPi";
import type { MatchFieldResponseType, SuppresionRuleCreateType, SuppressionRuleTypes, SuppressionRuleUpdateType } from "@/types/supers";

export async function getSupers() {
    const result = await axiosApi.get<SuppressionRuleTypes[]>("/supersession-rules/");
    return result.data;
};

export async function getSuperById(super_id: string) {
    const result = await axiosApi.get(`/supersession-rules/${super_id}`);
    return result.data;
};

export async function putSuperRule({
  super_id,
  data,
}: {
  super_id: string;
  data: SuppressionRuleUpdateType;
}) {
    const result = await axiosApi.put(`/supersession-rules/${super_id}`, data);
    return result.data;
};

export async function getSuperMatchFields() {
    const result = await axiosApi.get<MatchFieldResponseType>(
      `/supersession-rules/suppression-match-fields`,
    );
    return result.data;
};

export async function postSuperRule(data: SuppresionRuleCreateType) {
  const result = await axiosApi.post(`/supersession-rules/`, data);
  return result.data;
};