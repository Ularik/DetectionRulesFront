import { axiosApi } from "@/shared/api";
import type {
  CorrelationGroupByFieldsType,
  CorrelationRuleRequestCreateUpdateType,
  CorrelationRuleType,
  SequenceValueType,
} from "../model/types";

export async function createCorrelationRule(
  data: CorrelationRuleRequestCreateUpdateType,
) {
  const res = await axiosApi.post("/correlation-rules/", data);
  return res.data;
}

export async function updateCorrelationRule({
  correlation_id,
  data,
}: {
  correlation_id: string;
  data: CorrelationRuleRequestCreateUpdateType;
}) {
  const res = await axiosApi.put(`/correlation-rules/${correlation_id}`, data);
  return res.data;
}

export async function fetchCorrelationRules() {
  const result = await axiosApi.get<CorrelationRuleType[]>(
    "/correlation-rules/",
  );
  return result.data;
}

export async function fetchCorrelationRule(correlation_id: string) {
  const result = await axiosApi.get<CorrelationRuleType>(
    `/correlation-rules/${correlation_id}`,
  );
  return result.data;
}

export async function fetchSequenceOptions() {
  const res = await axiosApi.get<SequenceValueType[]>(
    "/correlation-rules/sequence",
  );
  return res.data;
}

// TODO: использует тот же эндпоинт, что и fetchSequenceOptions, хотя ожидает
// CorrelationGroupByFieldsType — похоже на опечатку, нужно сверить с backend
export async function fetchGroupByFields() {
  const res = await axiosApi.get<CorrelationGroupByFieldsType[]>(
    "/correlation-rules/sequence",
  );
  return res.data;
}
