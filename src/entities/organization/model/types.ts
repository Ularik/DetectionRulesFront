export interface Organization {
  organization_id: string;
  name: string;
  aliases: string[];
  agent_names: string[];
  agent_ids: string[];
  hostnames: string[];
  enabled: boolean;
}


export interface OrganizationCreateUpdateApiResponse {
  success: boolean;
  organization: Organization;
}

export interface OrganizationListApiResponse {
  items: Organization[];
}

export interface AgentType {
  agent_id: string;
  agent_name: string;
  status: string;
}

export interface OrganizationCreateUpdateType {
  name: string;
  aliases: string[];
  agent_ids: string[];
  hostnames: string[];
  enabled: boolean;
}
