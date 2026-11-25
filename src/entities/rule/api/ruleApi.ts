import { axiosApi } from "@/shared/api";
import type {
  AllRulesResponse,
  DetectionCategory,
  DetectionScope,
  QueryFiltersType,
  RuleApiResponse,
  RuleCreateUpdateType,
  RuleDeleteResponse,
  RuleEditorRole,
  RuleStatusPatchType,
  RuleTestRequest,
  RuleTestResponse,
  RuleType,
} from "../model/types";

/** GET /rules/ принимает limit строго меньше 20 */
export const RULES_MAX_LIMIT = 19;

export const fetchRules = async (filters: QueryFiltersType) => {
  const result = await axiosApi.get<RuleApiResponse>("/rules/", {
    params: filters,
  });
  return result.data;
};

// Пачка правил; если backend не может отдать пачку (500 из-за одной битой записи),
// перезапрашиваем её по одному правилу и пропускаем только сломанные
async function fetchRulesChunk(offset: number, limit: number) {
  try {
    const { items } = await fetchRules({ offset, limit });
    return { items, failed: 0 };
  } catch {
    const single = await Promise.allSettled(
      Array.from({ length: limit }, (_, index) =>
        fetchRules({ offset: offset + index, limit: 1 }),
      ),
    );
    const items = single.flatMap((result) =>
      result.status === "fulfilled" ? result.value.items : [],
    );
    return { items, failed: limit - items.length };
  }
}

// total из ответа на одно правило; битая запись на позиции offset даёт 500 — пробуем следующие
async function fetchRulesTotal() {
  let lastError: unknown;
  for (let offset = 0; offset < 5; offset += 1) {
    try {
      return (await fetchRules({ offset, limit: 1 })).total;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/**
 * Все правила целиком: фильтры по scope/категории/статусу/severity и счётчики раздела
 * backend не считает, поэтому список собирается на клиенте пачками по RULES_MAX_LIMIT
 */
export const fetchAllRules = async (): Promise<AllRulesResponse> => {
  const first = await fetchRules({ offset: 0, limit: RULES_MAX_LIMIT }).catch(
    () => null,
  );
  const total = first?.total ?? (await fetchRulesTotal());

  const offsets: number[] = [];
  for (let offset = first ? RULES_MAX_LIMIT : 0; offset < total; offset += RULES_MAX_LIMIT) {
    offsets.push(offset);
  }
  const chunks = await Promise.all(
    offsets.map((offset) =>
      fetchRulesChunk(offset, Math.min(RULES_MAX_LIMIT, total - offset)),
    ),
  );

  const items = [
    ...(first?.items ?? []),
    ...chunks.flatMap((chunk) => chunk.items),
  ];
  return {
    items,
    total,
    failed: Math.max(0, total - items.length),
  };
};

export const fetchRule = async (rule_id: string) => {
  const result = await axiosApi.get<RuleType>(
    `/rules/${encodeURIComponent(rule_id)}`,
  );
  return result.data;
};

export const fetchSeverityHints = async () => {
  const result = await axiosApi.get<string[]>("/rules/enums/severity-hints");
  return result.data;
};

export const fetchDetectionCategories = async () => {
  const result = await axiosApi.get<DetectionCategory[]>(
    "/rules/enums/detection-categories",
  );
  return result.data;
};

export const fetchDetectionScopes = async () => {
  const result = await axiosApi.get<DetectionScope[]>(
    "/rules/enums/detection-scopes",
  );
  return result.data;
};

// Создавать и изменять правила могут ADMIN (/rules/admin/) и ANALYST (/rules/analyst/);
// удаление, вкл/выкл и тест есть только у админа
const editorBase = (role: RuleEditorRole = "ADMIN") =>
  role === "ANALYST" ? "/rules/analyst" : "/rules/admin";

/** Существует ли правило: GET /rules/?rule_id= отдаёт страницу из одного правила или пустую */
export const ruleExists = async (rule_id: string) => {
  const { items } = await fetchRules({ rule_id, limit: 1, offset: 0 });
  return items.some((rule) => rule.rule_id === rule_id);
};

export const createRule = async ({
  data,
  role,
}: {
  data: RuleCreateUpdateType;
  role?: RuleEditorRole;
}) => {
  const result = await axiosApi.post<RuleType>(`${editorBase(role)}/`, data);
  return result.data;
};

export const deleteRule = async (rule_id: string) => {
  const result = await axiosApi.delete<RuleDeleteResponse>(
    `/rules/admin/${encodeURIComponent(rule_id)}`,
  );
  return result.data;
};

export async function updateRule({
  rule_id,
  data,
  role,
}: {
  rule_id: string;
  data: RuleCreateUpdateType;
  role?: RuleEditorRole;
}): Promise<RuleType> {
  const result = await axiosApi.put<RuleType>(
    `${editorBase(role)}/${encodeURIComponent(rule_id)}`,
    data,
  );
  return result.data;
}

export async function patchRuleStatus({
  rule_id,
  data,
}: {
  rule_id: string;
  data: RuleStatusPatchType;
}): Promise<RuleType> {
  const result = await axiosApi.patch<RuleType>(
    `/rules/admin/${encodeURIComponent(rule_id)}`,
    data,
  );
  return result.data;
}

export const testRule = async (data: RuleTestRequest) => {
  const result = await axiosApi.post<RuleTestResponse>("/rules/admin/test", data);
  return result.data;
};
