
export interface IocCreateType {
  ioc_type: string;
  value: string;
}

export interface IocType {
  ioc_id: string;
  ioc_type: string;
  value: string;
  threat_type: string;
  severity: string;
  confidence: number;
  source: string;
  source_org?: string | null;
  description?: string | null;
  tags: string[];
  misp_event_id?: string | null;
  misp_event_uuid?: string | null;
  misp_attribute_id?: string | null;
  misp_attribute_uuid?: string | null;
  to_ids: boolean;
  last_seen_at: string;
  received_at: string;
  viewed: boolean;
  viewed_at?: string | null;
  viewed_by?: string | null;
}

export type IocPatchType = Partial<
  Omit<IocType, "ioc_id" | "last_seen_at" | "received_at">
>;

export interface IocPatchResponse {
  success: boolean;
  ioc: IocType;
}

export interface IocPaginatedResponse {
  items: IocType[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface IocQueryParams {
  page?: number;
  size?: number;
  [key: string]: string | number | boolean | undefined;
}

// Compatibility alias for the backend schema name.
export type IocItemPatchcSchema = IocPatchResponse;
