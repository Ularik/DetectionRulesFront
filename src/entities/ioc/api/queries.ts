import { useQuery } from "@tanstack/react-query";
import type { IocQueryParams } from "../model/types";
import { fetchIoc, fetchIocs } from "./iocApi";
import { iocKeys } from "./queryKeys";

export function useIocs(params: IocQueryParams) {
  return useQuery({
    queryKey: iocKeys.list(params),
    queryFn: () => fetchIocs(params),
  });
}

export function useIoc(iocId: string) {
  return useQuery({
    queryKey: iocKeys.detail(iocId),
    queryFn: () => fetchIoc(iocId),
    enabled: Boolean(iocId),
  });
}
