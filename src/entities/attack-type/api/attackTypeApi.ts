import { axiosApi } from "@/shared/api";
import type { AttackApiResponseTypes } from "../model/types";

export async function fetchAttackTypes(): Promise<AttackApiResponseTypes> {
  const res = await axiosApi.get<AttackApiResponseTypes>("/attack-types/");
  return res.data;
}
