import { postCrule, getCrules, getCruleDetail, putCrule } from "./cRuleRequests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export function useCreateCrule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postCrule,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["crules"]})
    }
  });
}

export function useUpdateCrule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putCrule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crules"] });
    },
  });
}

export const useCrules = () => {
  return useQuery({
    queryKey: ["crules"],
    queryFn: getCrules,
    staleTime: 5 * 60 * 1000, // 5 минут данные считаются "свежими"
    gcTime: 10 * 60 * 1000, // Кэш хранится в памяти 10 минут после размонтирования

    refetchOnWindowFocus: false, // Отключает запрос при смене вкладок или возвращении в браузер
  });
};

export const useCruleDetail = (correlation_id: string) => {
      return useQuery({
        queryKey: ["crules", correlation_id],
        queryFn: () => getCruleDetail(correlation_id),
      });
}