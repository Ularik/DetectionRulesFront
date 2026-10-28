import { useMutation, useQueryClient } from "@tanstack/react-query";
import { iocKeys, patchIoc, type IocPatchType } from "@/entities/ioc";

// UI для редактирования IOC пока нет — хук готов для будущей формы
export function useUpdateIoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ iocId, data }: { iocId: string; data: IocPatchType }) =>
      patchIoc(iocId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: iocKeys.lists() });
      queryClient.invalidateQueries({ queryKey: iocKeys.detail(variables.iocId) });
    },
  });
}
