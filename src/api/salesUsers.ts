import { apiClient } from "./client";
import type { CreateSalesUserRequest, SalesUserDto } from "../types";

export const salesUsersApi = {
  getAll: async (): Promise<SalesUserDto[]> => {
    const { data } = await apiClient.get<SalesUserDto[]>("/api/salesusers");
    return data;
  },

  create: async (payload: CreateSalesUserRequest): Promise<SalesUserDto> => {
    const { data } = await apiClient.post<SalesUserDto>("/api/salesusers", payload);
    return data;
  },
};
