import axiosApi from "@/lib/axiosAPi";
import {
  IocCreateType,
  IocPaginatedResponse,
  IocPatchResponse,
  IocPatchType,
  IocQueryParams,
  IocType,
} from "@/types/ioc";

export async function postIoc(data: IocCreateType): Promise<IocType> {
  const result = await axiosApi.post<IocType>("/ioc/", data);
  return result.data;
}

export async function getIoc(
  params: IocQueryParams,
): Promise<IocPaginatedResponse> {
  const result = await axiosApi.get<IocPaginatedResponse>("/ioc/", {
    params,
  });
  return result.data;
}

export async function getIocDetail(iocId: string): Promise<IocType> {
  const result = await axiosApi.get<IocType>(`/ioc/${iocId}`);
  return result.data;
}

export async function patchIocDetail(
  iocId: string,
  data: IocPatchType,
): Promise<IocPatchResponse> {
  const result = await axiosApi.patch<IocPatchResponse>(`/ioc/${iocId}`, data);
  return result.data;
}
