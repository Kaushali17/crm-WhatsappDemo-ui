import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salesUsersApi } from "../api/salesUsers";
import { queryKeys } from "./queryKeys";
import type { CreateSalesUserRequest } from "../types";

export function useSalesUsers() {
  return useQuery({
    queryKey: queryKeys.salesUsers,
    queryFn: salesUsersApi.getAll,
  });
}

export function useCreateSalesUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalesUserRequest) => salesUsersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesUsers });
    },
  });
}
