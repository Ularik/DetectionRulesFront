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
  rule: (ruleId: string) => `/admin/rules/${encodeURIComponent(ruleId)}`,
  incidents: "/admin/incidents",
  incident: (incidentId: string) =>
    `/admin/incidents/${encodeURIComponent(incidentId)}`,
  sourceIpIncidents: (sourceIp: string) =>
    `/admin/incidents/ip/${encodeURIComponent(sourceIp)}`,
  audit: "/admin/audit",
  auditEntry: (auditId: string) =>
    `/admin/audit/${encodeURIComponent(auditId)}`,
  correlationRules: "/admin/crule",
  correlationRuleNew: "/admin/crule/new",
  correlationRule: (correlationId: string) => `/admin/crule/${correlationId}`,
  ioc: "/admin/ioc",
  iocNew: "/admin/ioc/new",
  iocEntry: (iocId: string) => `/admin/ioc/${encodeURIComponent(iocId)}`,
  suppressionRules: "/admin/supers",
  suppressionRuleNew: "/admin/supers/new",
  suppressionRule: (suppressionId: string) => `/admin/supers/${suppressionId}`,
  suppressionRuleEdit: (suppressionId: string) =>
    `/admin/supers/${suppressionId}/edit`,
  scenarios: "/admin/scenarios",
  scenario: (scenarioId: string) =>
    `/admin/scenarios/${encodeURIComponent(scenarioId)}`,
  events: "/admin/events",
  event: (indexName: string, eventId: string) =>
    `/admin/events/${encodeURIComponent(indexName)}/${encodeURIComponent(eventId)}`,
  mitre: "/admin/mitre",
  mitreTechnique: (mitreId: string) =>
    `/admin/mitre/${encodeURIComponent(mitreId)}`,
} as const;

export const roleDashboardPaths: Record<UserRole, string> = {
  ADMIN: routes.admin,
  ANALYST: routes.analyst,
  VIEWER: routes.viewer,
};
