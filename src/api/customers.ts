import { apiClient } from "./client";
import type { CreateCustomerRequest, CustomerDto, UpdateCustomerRequest } from "../types";

export const customersApi = {
  getAll: async (salesUserId?: string): Promise<CustomerDto[]> => {
    // Admin passes no salesUserId (all customers); a salesperson passes their own id. The
    // backend authorizes and returns the appropriate set.
    const { data } = await apiClient.get<CustomerDto[]>("/api/customers", {
      params: salesUserId ? { salesUserId } : undefined,
    });
    return data;
  },

  getById: async (id: string): Promise<CustomerDto> => {
    const { data } = await apiClient.get<CustomerDto>(`/api/customers/${id}`);
    return data;
  },

  create: async (payload: CreateCustomerRequest): Promise<CustomerDto> => {
    const { data } = await apiClient.post<CustomerDto>("/api/customers", payload);
    return data;
  },

  update: async (id: string, payload: UpdateCustomerRequest): Promise<CustomerDto> => {
    const { data } = await apiClient.put<CustomerDto>(`/api/customers/${id}`, payload);
    return data;
  },
};
