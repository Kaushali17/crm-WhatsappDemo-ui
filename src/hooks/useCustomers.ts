import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "../api/customers";
import { queryKeys } from "./queryKeys";
import type { CreateCustomerRequest, UpdateCustomerRequest } from "../types";

export function useCustomers(salesUserId?: string) {
  return useQuery({
    queryKey: queryKeys.customersList(salesUserId),
    queryFn: () => customersApi.getAll(salesUserId),
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.customer(id ?? ""),
    queryFn: () => customersApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerRequest) => customersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerRequest }) =>
      customersApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}
