import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useSalesUsers } from "../hooks/useSalesUsers";
import {
  CurrentUserContext,
  CURRENT_USER_STORAGE_KEY,
  type CurrentUserContextValue,
} from "./currentUser";

// This POC has no real login. The "current user" is chosen from the existing sales users list
// (GET /api/salesusers) and persisted locally. The user's Role comes from the backend
// (SalesUserDto.role) — it is NEVER derived from a hard-coded salesperson id. The backend
// remains the source of truth for authorization.
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const salesUsersQuery = useSalesUsers();
  const [currentUserId, setCurrentUserIdState] = useState<string>(
    () => localStorage.getItem(CURRENT_USER_STORAGE_KEY) ?? ""
  );

  const setCurrentUserId = useCallback((id: string) => {
    setCurrentUserIdState(id);
    if (id) localStorage.setItem(CURRENT_USER_STORAGE_KEY, id);
    else localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }, []);

  const salesUsers = useMemo(() => salesUsersQuery.data ?? [], [salesUsersQuery.data]);
  const currentUser = useMemo(
    () => salesUsers.find((u) => u.id === currentUserId),
    [salesUsers, currentUserId]
  );
  const role = currentUser?.role;
  const isAdmin = (role ?? "").toLowerCase() === "admin";

  const value = useMemo<CurrentUserContextValue>(
    () => ({
      currentUserId,
      currentUser,
      role,
      isAdmin,
      salesUsers,
      isLoading: salesUsersQuery.isLoading,
      setCurrentUserId,
      // Admin sees all (no scope). A salesperson is scoped to their own id; the backend still
      // enforces authorization regardless of what the frontend sends.
      conversationScopeUserId: isAdmin ? undefined : currentUser?.id,
    }),
    [currentUserId, currentUser, role, isAdmin, salesUsers, salesUsersQuery.isLoading, setCurrentUserId]
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}
