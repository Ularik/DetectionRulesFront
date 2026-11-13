import { axiosApi } from "@/shared/api";
import type {
  AttackApiResponseTypes,
  AttackGroupsParams,
  AttackGroupsResponseSchema,
} from "../model/types";

export async function fetchAttackTypes(): Promise<AttackApiResponseTypes> {
  const res = await axiosApi.get<AttackApiResponseTypes>("/attack-types/");
  return res.data;
}

export async function fetchAttackGroups(params: AttackGroupsParams) {
  const res = await axiosApi.get<AttackGroupsResponseSchema>(
    "/attack-types/attach-group",
    { params },
  );
  return res.data;
}
