import { useQuery, useMutation } from "@tanstack/react-query";
import { getMe, login } from "./usersRequests";


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