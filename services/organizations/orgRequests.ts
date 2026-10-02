import {
  Organization,
  OrganizationListApiResponse,
  OrganizationCreateUpdateType,
  OrganizationCreateUpdateApiResponse,
  AgentType,
} from "@/types/organizations";
import axiosApi from "@/lib/axiosAPi";

export async function getOrganizations(): Promise<OrganizationListApiResponse> {
  const res =
    await axiosApi.get<OrganizationListApiResponse>("/organizations/");
  return res.data;
}

export async function getOrganizationDetail(
  organizationId: string,
): Promise<Organization> {
  const res = await axiosApi.get<Organization>(
    `/organizations/${organizationId}`,
  );
  return res.data;
}

export async function getAgents(): Promise<AgentType[]> {
  const res = await axiosApi.get<AgentType[]>("/organizations/agents");
  return res.data;
}

export async function postOrganization(
  data: OrganizationCreateUpdateType,
): Promise<OrganizationCreateUpdateApiResponse> {
  const res = await axiosApi.post<OrganizationCreateUpdateApiResponse>(
    "/organizations/",
    data,
  );
  return res.data;
}

export async function putOrganization(
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
