import axiosApi from "@/lib/axiosAPi";
import type { AttackApiResponseTypes } from "@/types/attackTypes";


export async function getAttackTypes(): Promise<AttackApiResponseTypes> {
    const res = await axiosApi.get("/attack-types/");
    return res.data;
}