import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIoc, iocKeys, type IocCreateType } from "@/entities/ioc";

export function useCreateIoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IocCreateType) => createIoc(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: iocKeys.lists() });
    },
  });
}
