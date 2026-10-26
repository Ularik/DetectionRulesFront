import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout, userKeys } from "@/entities/user";

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}
