import { axiosApi } from "@/shared/api";
import type {
  IocCreateType,
  IocPaginatedResponse,
  IocPatchResponse,
  IocPatchType,
  IocQueryParams,
  IocType,
} from "../model/types";

export async function createIoc(data: IocCreateType): Promise<IocType> {
  const result = await axiosApi.post<IocType>("/ioc/", data);
  return result.data;
}

export async function fetchIocs(
  params: IocQueryParams,
): Promise<IocPaginatedResponse> {
  const result = await axiosApi.get<IocPaginatedResponse>("/ioc/", {
    params,
  });
  return result.data;
}

export async function fetchIoc(iocId: string): Promise<IocType> {
  const result = await axiosApi.get<IocType>(`/ioc/${iocId}`);
  return result.data;
}

export async function patchIoc(
  iocId: string,
  data: IocPatchType,
): Promise<IocPatchResponse> {
  const result = await axiosApi.patch<IocPatchResponse>(`/ioc/${iocId}`, data);
  return result.data;
}
