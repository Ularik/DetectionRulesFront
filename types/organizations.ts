export interface Organization {
  organization_id: string;
  name: string;
  aliases: string[];
  agent_names: string[];
  agent_ids: string[];
  hostnames: string[];
  enabled: boolean;
}

export interface OrganizationListApiResponse {
  items: Organization[];
}
