import { axiosApi } from "@/shared/api";
import { normalizeEngineSettings } from "../lib/settings";
import type {
  EngineSettings,
  EngineSettingsResponse,
  EngineSettingsUpdateResponse,
  EngineSettingsValidateResponse,
} from "../model/types";

export async function fetchEngineSettings(): Promise<EngineSettingsResponse> {
  const res = await axiosApi.get<EngineSettingsResponse>("/engine-settings/");
  return normalizeEngineSettings(res.data);
}

export async function updateEngineSettings(
  data: EngineSettings,
): Promise<EngineSettingsUpdateResponse> {
  const res = await axiosApi.put<EngineSettingsUpdateResponse>("/engine-settings/", data);
  return { success: res.data.success, settings: normalizeEngineSettings(res.data.settings) };
}

export async function validateEngineSettings(
  data: EngineSettings,
): Promise<EngineSettingsValidateResponse> {
  const res = await axiosApi.post<EngineSettingsValidateResponse>("/engine-settings/validate", data);
  return { valid: res.data.valid, settings: normalizeEngineSettings(res.data.settings) };
}

export async function resetEngineSettings(): Promise<EngineSettingsUpdateResponse> {
  const res = await axiosApi.post<EngineSettingsUpdateResponse>("/engine-settings/reset");
  return { success: res.data.success, settings: normalizeEngineSettings(res.data.settings) };
}
