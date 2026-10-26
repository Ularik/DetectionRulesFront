import { axiosApi } from "@/shared/api";
import type { AttackApiResponseTypes } from "@/types/attackTypes";


export async function getAttackTypes(): Promise<AttackApiResponseTypes> {
    const res = await axiosApi.get("/attack-types/");
    return res.data;
}