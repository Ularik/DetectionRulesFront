import { axiosApi } from "@/shared/api";
import type {
  CorrelationGroupByResponse,
  CorrelationRuleDeleteResponse,
  CorrelationRuleRequestCreateUpdateType,
  CorrelationRuleStatusType,
  CorrelationRuleTestRequest,
  CorrelationRuleTestResponse,
  CorrelationRuleType,
  ScenarioTypesResponse,
  SequenceValueType,
} from "../model/types";

const rulePath = (correlationId: string) =>
  `/correlation-rules/${encodeURIComponent(correlationId)}`;

/** GET /correlation-rules/ — массив без пагинации и фильтров */
export async function fetchCorrelationRules() {
  const result = await axiosApi.get<CorrelationRuleType[]>("/correlation-rules/");
  return result.data;
}

export async function fetchCorrelationRule(correlationId: string) {
  const result = await axiosApi.get<CorrelationRuleType>(rulePath(correlationId));
  return result.data;
}

/** POST /correlation-rules/ отвечает 201; схема ответа в OpenAPI не описана — ожидаем правило */
export async function createCorrelationRule(data: CorrelationRuleRequestCreateUpdateType) {
  const result = await axiosApi.post<Partial<CorrelationRuleType> | null>(
    "/correlation-rules/",
    data,
  );
  return result.data;
}

export async function updateCorrelationRule({
  correlation_id,
  data,
}: {
  correlation_id: string;
  data: CorrelationRuleRequestCreateUpdateType;
}) {
  const result = await axiosApi.put<CorrelationRuleType>(rulePath(correlation_id), data);
  return result.data;
}

export async function deleteCorrelationRule(correlationId: string) {
  const result = await axiosApi.delete<CorrelationRuleDeleteResponse>(rulePath(correlationId));
  return result.data;
}

/** PATCH /correlation-rules/{id}/status — возвращает правило в актуальном состоянии */
export async function patchCorrelationRuleStatus({
  correlation_id,
  data,
}: {
  correlation_id: string;
  data: CorrelationRuleStatusType;
}) {
  const result = await axiosApi.patch<CorrelationRuleType>(
    `${rulePath(correlation_id)}/status`,
    data,
  );
  return result.data;
}

/** POST /correlation-rules/test — прогон правила на инцидентах без сохранения */
export async function testCorrelationRule(data: CorrelationRuleTestRequest) {
  const result = await axiosApi.post<CorrelationRuleTestResponse>("/correlation-rules/test", data);
  return result.data;
}

export async function fetchSequenceOptions() {
  const result = await axiosApi.get<SequenceValueType[]>("/correlation-rules/sequence");
  return result.data;
}

/** GET /correlation-rules/group-by-fields отдаёт { items, count } */
export async function fetchGroupByFields() {
  const result = await axiosApi.get<CorrelationGroupByResponse>(
    "/correlation-rules/group-by-fields",
  );
  return result.data.items;
}

/** GET /correlation-rules/scenario-types отдаёт { items, count } */
export async function fetchScenarioTypes() {
  const result = await axiosApi.get<ScenarioTypesResponse>("/correlation-rules/scenario-types");
  return result.data.items;
}
