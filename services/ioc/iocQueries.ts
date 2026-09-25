import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getIoc,
  getIocDetail,
  patchIocDetail,
  postIoc,
} from "./iocRequests";
import {
  IocCreateType,
  IocPatchType,
  IocQueryParams,
} from "@/types/ioc";

export function useIoc(params: IocQueryParams) {
  return useQuery({
    queryKey: ["ioc", params],
    queryFn: () => getIoc(params),
  });
}

export function useIocDetail(iocId: string) {
  return useQuery({
    queryKey: ["ioc", iocId],
    queryFn: () => getIocDetail(iocId),
    enabled: Boolean(iocId),
  });
}

export function usePostIoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IocCreateType) => postIoc(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ioc"] });
    },
  });
}

export function usePatchIoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ iocId, data }: { iocId: string; data: IocPatchType }) =>
      patchIocDetail(iocId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ioc"] });
      queryClient.invalidateQueries({ queryKey: ["ioc", variables.iocId] });
    },
  });
}
