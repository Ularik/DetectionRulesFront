import { WazuhEvent } from "./events";


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
