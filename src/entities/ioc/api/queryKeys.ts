import type { IocQueryParams } from "../model/types";

export const iocKeys = {
  all: ["ioc"] as const,
  lists: () => [...iocKeys.all, "list"] as const,
  list: (params: IocQueryParams) => [...iocKeys.lists(), params] as const,
  detail: (iocId: string) => [...iocKeys.all, "detail", iocId] as const,
};
