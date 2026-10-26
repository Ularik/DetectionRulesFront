export interface MitreType {
  ids: string[];
  tactics: string[];
  techniques: string[];
}

export interface MitreTechnique {
  mitre_id: string;
  stix_id: string;
  name: string;
  description: string;
  tactics: string[];
  platforms: string[];
  is_subtechnique: boolean;
  revoked: boolean;
  deprecated: boolean;
  modified: string; // ISO date string
  version: string;
  source_url: string;
  domain: string;
  source: string;
  synced_at: string; // ISO date string
}

export interface MitreSyncResponse {
  success: boolean;
  source: string;
  received: number;
  indexed: number;
  active: number;
  revoked: number;
  deprecated: number;
  skipped: number;
  synced_at: string;
}