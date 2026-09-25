import axiosApi from "@/lib/axiosAPi";
import type {
  CorrelationRuleRequestCreateUpdateType,
  CorrelationRuleType,
} from "@/types/crules";

export async function postCrule(data: CorrelationRuleRequestCreateUpdateType) {
  const res = await axiosApi.post("/correlation-rules/", data);
  return res.data;
}

export async function putCrule({correlation_id, data}: {correlation_id: string, data: CorrelationRuleRequestCreateUpdateType}) {
  const res = await axiosApi.put(`/correlation-rules/${correlation_id}`, data);
  return res.data;
}

export async function getCrules() {
  const result = await axiosApi.get<CorrelationRuleType[]>(
    "/correlation-rules/",
  );
  return result.data;
}

export async function getCruleDetail(correlation_id: string) {
  const result = await axiosApi.get<CorrelationRuleType>(
    `/correlation-rules/${correlation_id}`,
  );
  return result.data;
}