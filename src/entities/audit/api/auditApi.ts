import { axiosApi } from "@/shared/api";
import type {
  ApiAuditResponseType,
  AuditDetailType,
  AuditParams,
  RuleAuditParams,
  ApiCorrelationAuditResponse,
  CorrelationAuditDetailType,
  CorrelationAuditParams,
} from "../model/types";

export async function fetchAudits(
  params: AuditParams,
): Promise<ApiAuditResponseType> {
  const result = await axiosApi.get<ApiAuditResponseType>("/audits/", {
    params,
  });
  return result.data;
}

export async function fetchAudit(id: string): Promise<AuditDetailType> {
  const result = await axiosApi.get<AuditDetailType>(`/audits/${id}`);
  return result.data;
}

/** История изменений одного правила обнаружения (с авторами) */
export async function fetchRuleAudits(
  ruleId: string,
  params: RuleAuditParams,
): Promise<ApiAuditResponseType> {
  const result = await axiosApi.get<ApiAuditResponseType>(
    `/audits/rule/${encodeURIComponent(ruleId)}`,
    { params },
  );
  return result.data;
}

// GET /audits/rule/{id}: limit строго меньше 20
const RULE_AUDITS_MAX_LIMIT = 19;

/** Вся история правила обнаружения (пачками по 19) — для фильтрации на клиенте:
 * фильтра по действию у этого эндпоинта нет */
export async function fetchAllRuleAudits(ruleId: string): Promise<ApiAuditResponseType> {
  const first = await fetchRuleAudits(ruleId, { limit: RULE_AUDITS_MAX_LIMIT, offset: 0 });
  const offsets: number[] = [];
  for (let offset = RULE_AUDITS_MAX_LIMIT; offset < first.total; offset += RULE_AUDITS_MAX_LIMIT) {
    offsets.push(offset);
  }
  const rest = await Promise.all(
    offsets.map((offset) => fetchRuleAudits(ruleId, { limit: RULE_AUDITS_MAX_LIMIT, offset })),
  );
  return { total: first.total, items: [first, ...rest].flatMap((page) => page.items) };
}

/** История изменений всех правил корреляции (фильтры: action, author_id) */
export async function fetchCorrelationAudits(
  params: CorrelationAuditParams,
): Promise<ApiCorrelationAuditResponse> {
  const result = await axiosApi.get<ApiCorrelationAuditResponse>("/audits/correlation-rules", {
    params,
  });
  return result.data;
}

/** История изменений одного правила корреляции (фильтр: action) */
export async function fetchCorrelationRuleAudits(
  correlationId: string,
  params: Omit<CorrelationAuditParams, "author_id">,
): Promise<ApiCorrelationAuditResponse> {
  const result = await axiosApi.get<ApiCorrelationAuditResponse>(
    `/audits/correlation-rules/rule/${encodeURIComponent(correlationId)}`,
    { params },
  );
  return result.data;
}

/** Запись истории: версия правила и изменённые поля относительно предыдущей версии */
export async function fetchCorrelationAudit(auditId: number): Promise<CorrelationAuditDetailType> {
  const result = await axiosApi.get<CorrelationAuditDetailType>(
    `/audits/correlation-rules/${auditId}`,
  );
  return result.data;
}
