import { axiosApi } from "@/shared/api";
import type {
  Organization,
  OrganizationListApiResponse,
  OrganizationCreateUpdateType,
  OrganizationCreateUpdateApiResponse,
  AgentType,
} from "../model/types";

export async function fetchOrganizations(): Promise<OrganizationListApiResponse> {
  const res =
    await axiosApi.get<OrganizationListApiResponse>("/organizations/");
  return res.data;
}

export async function fetchOrganization(
  organizationId: string,
): Promise<Organization> {
  const res = await axiosApi.get<Organization>(
    `/organizations/${organizationId}`,
  );
  return res.data;
}

export async function fetchAgents(): Promise<AgentType[]> {
  const res = await axiosApi.get<AgentType[]>("/organizations/agents");
  return res.data;
}

export async function createOrganization(
  data: OrganizationCreateUpdateType,
): Promise<OrganizationCreateUpdateApiResponse> {
  const res = await axiosApi.post<OrganizationCreateUpdateApiResponse>(
    "/organizations/",
    data,
  );
  return res.data;
}

export async function updateOrganization(
  organizationId: string,
  data: OrganizationCreateUpdateType,
): Promise<OrganizationCreateUpdateApiResponse> {
  const res = await axiosApi.put<OrganizationCreateUpdateApiResponse>(
    `/organizations/${encodeURIComponent(organizationId)}`,
    data,
  );
  return res.data;
}

export async function deleteOrganization(
  organizationId: string,
): Promise<void> {
  await axiosApi.delete(`/organizations/${encodeURIComponent(organizationId)}`);
}
