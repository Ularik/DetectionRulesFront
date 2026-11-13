export interface AttackTypes {
  label: string;
  value: string;
}

export interface AttackApiResponseTypes {
  items: AttackTypes[];
  count: number;
}

// GET /attack-types/attach-group — инциденты одного source_ip, сгруппированные по типам атак
export interface AttackGroupsParams {
  source_ip: string;
  organization_id?: string;
  from_time?: string;
  to_time?: string;
  page: number;
  size: number;
}

export interface HuntingIpSummarySchema {
  incident_count: number;
  attack_type_count: number;
  destination_count: number;
  scenario_count: number;
  event_count: number;
}

export interface AttackGroupDestinationSchema {
  destination_ip: string;
  incident_count: number;
}

export interface AttackGroupSchema {
  attack_type: string;
  incident_count: number;
  event_count: number;
  destination_count: number;
  first_seen: string | null;
  last_seen: string | null;
  severities: string[];
  mitre_ids: string[];
  tactics: string[];
  destinations: AttackGroupDestinationSchema[];
}

export interface HuntingIpDestinationSchema {
  destination_ip: string;
  incident_count: number;
  event_count: number;
  attack_types: string[];
  first_seen: string | null;
  last_seen: string | null;
}

export interface HuntingIpIncidentSchema {
  incident_id: string;
  organization_id: string | null;
  attack_type: string | null;
  source_ip: string | null;
  destination_ip: string | null;
  destination_ips: string[];
  destination_host: string | null;
  asset_id: string | null;
  asset_hostname: string | null;
  asset_type: string | null;
  asset_criticality: string | null;
  asset_tags: string[];
  start_time: string | null;
  end_time: string | null;
  severity: string | null;
  risk_score: number | null;
  priority: number | null;
  decision: string | null;
  action: string | null;
  event_count: number;
  mitre_ids: string[];
  tactics: string[];
  scenario_ids: string[];
  scenario_count: number;
}

// Общего total в ответе нет — всего инцидентов = summary.incident_count
export interface AttackGroupsResponseSchema {
  source_ip: string;
  from_time: string | null;
  to_time: string | null;
  summary: HuntingIpSummarySchema;
  attack_groups: AttackGroupSchema[];
  destinations: HuntingIpDestinationSchema[];
  incidents: HuntingIpIncidentSchema[];
  page: number;
  size: number;
}
