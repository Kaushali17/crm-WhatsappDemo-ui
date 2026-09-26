import { apiClient } from "./client";
import type { CreateCustomerRequest, CustomerDto, UpdateCustomerRequest } from "../types";

export const customersApi = {
  getAll: async (): Promise<CustomerDto[]> => {
    const { data } = await apiClient.get<CustomerDto[]>("/api/customers");
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
