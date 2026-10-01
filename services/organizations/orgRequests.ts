import { OrganizationListApiResponse } from "@/types/organizations";
import axiosApi from "@/lib/axiosAPi";


export async function getOrganizations(): Promise<OrganizationListApiResponse> {
    const res = await axiosApi.get<OrganizationListApiResponse>("/organizations/");
    return res.data;
}