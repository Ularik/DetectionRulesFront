import { axiosApi } from "@/shared/api";
import type { Asset, AssetCreateUpdateType, AssetListApiResponse } from "../model/types";

const assetPath = (assetId: string) => `/assets/${encodeURIComponent(assetId)}`;

// Фильтры (asset_type, criticality, enabled_only) у backend есть, но список небольшой —
// грузим целиком и фильтруем на клиенте вместе с поиском
export async function fetchAssets(): Promise<AssetListApiResponse> {
  const res = await axiosApi.get<AssetListApiResponse>("/assets/");
  return res.data;
}

export async function fetchAsset(assetId: string): Promise<Asset> {
  const res = await axiosApi.get<Asset>(assetPath(assetId));
  return res.data;
}

// Схема ответа POST/PUT в OpenAPI не описана, поэтому возвращаем как есть
export async function createAsset(data: AssetCreateUpdateType): Promise<unknown> {
  const res = await axiosApi.post("/assets/", data);
  return res.data;
}

export async function updateAsset(assetId: string, data: AssetCreateUpdateType): Promise<unknown> {
  const res = await axiosApi.put(assetPath(assetId), data);
  return res.data;
}

export async function deleteAsset(assetId: string): Promise<void> {
  await axiosApi.delete(assetPath(assetId));
}
