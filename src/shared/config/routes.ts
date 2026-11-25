export type UserRole = "ADMIN" | "ANALYST" | "VIEWER";

export const routes = {
  login: "/login",
  register: "/auth",
  admin: "/admin",
  analyst: "/analyst",
  viewer: "/viewer",

  home: "/admin",

  organizations: "/admin/organizations",
  organizationNew: "/admin/organizations/new",
  organization: (organizationId: string) =>
    `/admin/organizations/${encodeURIComponent(organizationId)}`,
  organizationEdit: (organizationId: string) =>
    `/admin/organizations/${encodeURIComponent(organizationId)}/edit`,
  rules: "/admin/rules",
  ruleNew: "/admin/rules/new",
  /** copyFrom — открыть форму создания с копией существующего правила */
  ruleCopy: (copyFrom: string) =>
    `/admin/rules/new?copy=${encodeURIComponent(copyFrom)}`,
  rule: (ruleId: string) => `/admin/rules/${encodeURIComponent(ruleId)}`,
  /** Карточка правила сразу на вкладке «Тестирование» */
  ruleTest: (ruleId: string) =>
    `/admin/rules/${encodeURIComponent(ruleId)}?tab=test`,
  /** Карточка правила сразу на вкладке «История» (GET /audits/rule/{id}) */
  ruleHistory: (ruleId: string) =>
    `/admin/rules/${encodeURIComponent(ruleId)}?tab=history`,
  incidents: "/admin/incidents",
  incident: (incidentId: string) =>
    `/admin/incidents/${encodeURIComponent(incidentId)}`,
  sourceIpIncidents: (sourceIp: string) =>
    `/admin/incidents/ip/${encodeURIComponent(sourceIp)}`,
  audit: "/admin/audit",
  auditEntry: (auditId: string) =>
    `/admin/audit/${encodeURIComponent(auditId)}`,
  correlationRules: "/admin/correlation-rules",
  correlationRuleNew: "/admin/correlation-rules/new",
  /** copyFrom — открыть форму создания с копией существующего правила корреляции */
  correlationRuleCopy: (copyFrom: string) =>
    `/admin/correlation-rules/new?copy=${encodeURIComponent(copyFrom)}`,
  correlationRule: (correlationId: string) =>
    `/admin/correlation-rules/${encodeURIComponent(correlationId)}`,
  /** Карточка правила корреляции сразу на вкладке «Тестирование» */
  correlationRuleTest: (correlationId: string) =>
    `/admin/correlation-rules/${encodeURIComponent(correlationId)}?tab=test`,
  /** Карточка правила корреляции сразу на вкладке «История» */
  correlationRuleHistory: (correlationId: string) =>
    `/admin/correlation-rules/${encodeURIComponent(correlationId)}?tab=history`,
  ioc: "/admin/ioc",
  iocNew: "/admin/ioc/new",
  iocEntry: (iocId: string) => `/admin/ioc/${encodeURIComponent(iocId)}`,
  suppressionRules: "/admin/supers",
  suppressionRuleNew: "/admin/supers/new",
  /** copyFrom — открыть форму создания с копией существующего правила подавления */
  suppressionRuleCopy: (copyFrom: string) =>
    `/admin/supers/new?copy=${encodeURIComponent(copyFrom)}`,
  suppressionRule: (suppressionId: string) =>
    `/admin/supers/${encodeURIComponent(suppressionId)}`,
  /** Карточка правила подавления сразу на вкладке «Тестирование» */
  suppressionRuleTest: (suppressionId: string) =>
    `/admin/supers/${encodeURIComponent(suppressionId)}?tab=test`,
  scenarios: "/admin/scenarios",
  scenario: (scenarioId: string) =>
    `/admin/scenarios/${encodeURIComponent(scenarioId)}`,
  events: "/admin/events",
  event: (indexName: string, eventId: string) =>
    `/admin/events/${encodeURIComponent(indexName)}/${encodeURIComponent(eventId)}`,
  sources: "/admin/sources",
  sourceNew: "/admin/sources/new",
  source: (sourceId: string) => `/admin/sources/${encodeURIComponent(sourceId)}`,
  sourceEdit: (sourceId: string) =>
    `/admin/sources/${encodeURIComponent(sourceId)}/edit`,
  normalizationProfiles: "/admin/normalization-profiles",
  normalizationProfileNew: "/admin/normalization-profiles/new",
  /** copyFrom — открыть форму создания с копией существующего профиля */
  normalizationProfileCopy: (copyFrom: string) =>
    `/admin/normalization-profiles/new?copy=${encodeURIComponent(copyFrom)}`,
  normalizationProfile: (name: string) =>
    `/admin/normalization-profiles/${encodeURIComponent(name)}`,
  normalizationProfileEdit: (name: string) =>
    `/admin/normalization-profiles/${encodeURIComponent(name)}/edit`,
  normalizationFields: "/admin/normalization-fields",
  mitre: "/admin/mitre",
  mitreTechnique: (mitreId: string) =>
    `/admin/mitre/${encodeURIComponent(mitreId)}`,
} as const;

export const roleDashboardPaths: Record<UserRole, string> = {
  ADMIN: routes.admin,
  ANALYST: routes.analyst,
  VIEWER: routes.viewer,
};
