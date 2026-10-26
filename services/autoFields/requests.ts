import { axiosApi } from "@/shared/api";
import type { SequenceValueType, CorrelationGroupByFieldsType } from "@/types/crules";

export async function getSeguence() {
  const res = await axiosApi.get<SequenceValueType[]>(
    "/correlation-rules/sequence",
  );
  return res.data;
}

export async function getGroupByFields() {
  const res = await axiosApi.get<CorrelationGroupByFieldsType[]>(
    "/correlation-rules/sequence",
  );
  return res.data;
}