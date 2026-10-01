export interface WazuhAgent {
  ip?: string | null;
  id?: string | null;
  name?: string | null;
  version?: string | null;
  ephemeral_id?: string | null;
  type?: string | null;
}

export interface WazuhDecoder {
  name?: string | null;
}

export interface WazuhEcs {
  version?: string | null;
}

export interface WazuhOs {
  codename?: string | null;
  type?: string | null;
  platform?: string | null;
  version?: string | null;
  family?: string | null;
  name?: string | null;
  kernel?: string | null;
}

export interface WazuhHost {
  os?: WazuhOs | null;
  id?: string | null;
  containerized?: boolean | null;
  name?: string | null;
  ip: string[];
  mac: string[];
  hostname?: string | null;
  architecture?: string | null;
}

export interface WazuhLogFile {
  path?: string | null;
  device_id?: string | null;
  inode?: number | null;
}

export interface WazuhLog {
  offset?: number | null;
  file?: WazuhLogFile | null;
}

export interface WazuhManager {
  name?: string | null;
}

export interface WazuhPredecoder {
  program_name?: string | null;
  timestamp?: string | null;
  hostname?: string | null;
}

export interface WazuhInput {
  type?: string | null;
}

export interface WazuhEvent {
  "@timestamp"?: string | null;
  timestamp?: string | null;

  agent?: WazuhAgent | null;
  decoder?: WazuhDecoder | null;
  ecs?: WazuhEcs | null;
  host?: WazuhHost | null;
  log?: WazuhLog | null;

  location?: string | null;
  manager?: WazuhManager | null;

  full_log?: string | null;
  id?: string | null;

  predecoder?: WazuhPredecoder | null;
  input?: WazuhInput | null;

  _elastic_index?: string | null;
  _elastic_id?: string | null;
}

export interface IncidentEventResponse {
  incident_id: string;
  organization_id: string;
  attack_type: string;
  observer_host: string;

  items: WazuhEvent[];

  total: number;
  page: number;
  size: number;
  returned: number;

  missing: unknown[];

  missing_count: number;
}
