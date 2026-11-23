import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/lib/errors";
import { iocKeys, patchIoc } from "@/entities/ioc";

// PATCH /ioc/{id} без тела: backend фиксирует просмотр IOC текущим аналитиком
export function useMarkIocViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (iocId: string) => patchIoc(iocId),
    onSuccess: (_response, iocId) => {
      queryClient.invalidateQueries({ queryKey: iocKeys.detail(iocId) });
      queryClient.invalidateQueries({ queryKey: iocKeys.lists() });
      toast.success("IOC отмечен просмотренным");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Не удалось отметить IOC просмотренным"));
    },
  });
}
