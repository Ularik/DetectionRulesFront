import { getSeguence, getGroupByFields } from "./requests";
import { useQuery } from "@tanstack/react-query";


export function useSeguence() {
    return useQuery({
        queryKey: ["seguence"],
        queryFn: getSeguence
    })
};

export function useGroupByFields() {
    return useQuery({
      queryKey: ["groups"],
      queryFn: getGroupByFields,
    });
};