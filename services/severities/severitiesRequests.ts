import { axiosApi } from "@/shared/api";

export const fetchSeverities = async () => {
  const result = await axiosApi.get<string[]>(
    "rules/enums/severity-hints");
  return result.data;
};
