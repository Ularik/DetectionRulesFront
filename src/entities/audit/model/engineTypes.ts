// Журнал аудита движка: GET /audits/engine (EngineAuditSchema) — действия над всеми ресурсами
// (правила, IOC, организации, источники, активы…) со снимками до и после. Ответ — массив без total

export interface EngineAuditType {
  audit_id: string;
  timestamp: string;
  actor: string | null;
  role: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  organization_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
}

export interface EngineAuditParams {
  /** Сколько последних записей вернуть (по умолчанию у backend — 100) */
  size: number;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  organization_id?: string;
}
