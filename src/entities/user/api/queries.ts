import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "./userApi";
import { userKeys } from "./queryKeys";

export function useMe() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: fetchMe,
  });
}
