import { createContext, useContext } from "react";
import type { SalesUserDto } from "../types";

// Local storage key for the chosen current user (this POC has no real login).
export const CURRENT_USER_STORAGE_KEY = "crm.currentUserId";

export type CurrentUserContextValue = {
  currentUserId: string;
  currentUser: SalesUserDto | undefined;
  role: SalesUserDto["role"];
  isAdmin: boolean;
  salesUsers: SalesUserDto[];
  isLoading: boolean;
  setCurrentUserId: (id: string) => void;
  // Convenience scope for API calls: undefined for Admin (see everything), own id otherwise.
  conversationScopeUserId: string | undefined;
};

export const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(undefined);

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  return ctx;
}
