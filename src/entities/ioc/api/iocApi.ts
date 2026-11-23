import { axiosApi } from "@/shared/api";
import type {
  IocCreateType,
  IocPaginatedResponse,
  IocPatchResponse,
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
  const result = await axiosApi.get<IocType>(`/ioc/${encodeURIComponent(iocId)}`);
  return result.data;
}

// Тело не отправляется: PATCH отмечает IOC просмотренным текущим пользователем
export async function patchIoc(iocId: string): Promise<IocPatchResponse> {
  const result = await axiosApi.patch<IocPatchResponse>(`/ioc/${encodeURIComponent(iocId)}`);
  return result.data;
}
