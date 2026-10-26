import { useMutation } from "@tanstack/react-query";
import { login } from "@/entities/user";

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}
