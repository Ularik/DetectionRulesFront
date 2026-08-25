import axiosApi from "@/lib/axiosAPi";

export const fetchSeverities = async () => {
  const result = await axiosApi.get<string[]>(
    "rules/enums/severity-hints");
  return result.data;
};
