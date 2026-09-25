import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupers, getSuperById, putSuperRule, getSuperMatchFields, postSuperRule } from "./requests";


export function useSupers() {
    return useQuery({
        queryKey: ["supers"],
        queryFn: getSupers
    })
};


export function useSuperById(super_id: string) {
    return useQuery({
        queryKey: ["supers", super_id],
        queryFn: () => getSuperById(super_id)
    })
};


export function useEditSuperRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: putSuperRule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["supers"]});
        }  
    });
};

export function useSupersMatchFields() {
    return useQuery({
        queryKey: ["supersMatches"],
        queryFn: getSuperMatchFields
    })
};

export function useSuperRuleCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: postSuperRule,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["supers"] });
      },
    });
}