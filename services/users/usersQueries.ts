import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, login, logout, register } from "./usersRequests";


export function useMe() {
    return useQuery({
        queryKey: ["me"],
        queryFn: getMe
    });
};


export function useLogin() {
    return useMutation({
        mutationFn: login
    });
};


export function useLogout() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: logout,
      onSuccess: () => {
        queryClient.invalidateQueries({"queryKey": ["me"]})
      }
    });
}

export function useRegister() {
    return useMutation({
      mutationFn: register,
    });
}