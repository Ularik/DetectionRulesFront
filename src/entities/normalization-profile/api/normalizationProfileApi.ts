import { axiosApi } from "@/shared/api";
import type {
  NormalizationFieldsApiResponse,
  NormalizationProfileListApiResponse,
  NormalizationProfileType,
  NormalizationTestRequest,
  NormalizationTestResult,
} from "../model/types";

const basePath = "/normalization-profiles";
const profilePath = (name: string) => `${basePath}/${encodeURIComponent(name)}`;

export async function fetchNormalizationProfiles(): Promise<NormalizationProfileListApiResponse> {
  const res = await axiosApi.get<NormalizationProfileListApiResponse>(`${basePath}/`);
  return res.data;
}

export async function fetchNormalizationProfile(name: string): Promise<NormalizationProfileType> {
  const res = await axiosApi.get<NormalizationProfileType>(profilePath(name));
  return res.data;
}

export async function fetchNormalizationFields(): Promise<NormalizationFieldsApiResponse> {
  const res = await axiosApi.get<NormalizationFieldsApiResponse>(`${basePath}/fields`);
  return res.data;
}

// Применяет профиль к raw-событию без сохранения
export async function testNormalizationProfile(
  data: NormalizationTestRequest,
): Promise<NormalizationTestResult> {
  const res = await axiosApi.post<NormalizationTestResult>(`${basePath}/test`, data);
  return res.data;
}

export async function createNormalizationProfile(data: NormalizationProfileType): Promise<unknown> {
  const res = await axiosApi.post(`${basePath}/`, data);
  return res.data;
}

export async function updateNormalizationProfile(
  name: string,
  data: NormalizationProfileType,
): Promise<unknown> {
  const res = await axiosApi.put(profilePath(name), data);
  return res.data;
}

// Системные generic-профили backend удалить не даст
export async function deleteNormalizationProfile(name: string): Promise<void> {
  await axiosApi.delete(profilePath(name));
}
