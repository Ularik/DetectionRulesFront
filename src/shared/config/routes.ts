export type UserRole = "ADMIN" | "ANALYST" | "VIEWER";

export const routes = {
  login: "/login",
  register: "/auth",
  admin: "/admin",
  analyst: "/analyst",
  viewer: "/viewer",

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
  audit: "/admin/audit",
  auditEntry: (auditId: string) =>
    `/admin/audit/${encodeURIComponent(auditId)}`,
  correlationRules: "/admin/crule",
  ioc: "/admin/ioc",
  iocNew: "/admin/ioc/new",
  iocEntry: (iocId: string) => `/admin/ioc/${iocId}`,
  suppressionRules: "/admin/supers",
  hunters: "/admin/hunters",
  scenarios: "/admin/hunters/scenarios",
  events: "/admin/hunters/events",
  event: (indexName: string, eventId: string) =>
    `/admin/hunters/events/${encodeURIComponent(indexName)}/${encodeURIComponent(eventId)}`,
  mitre: "/admin/mitre",
} as const;

export const roleDashboardPaths: Record<UserRole, string> = {
  ADMIN: routes.admin,
  ANALYST: routes.analyst,
  VIEWER: routes.viewer,
};
