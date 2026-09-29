import { NavLink, Outlet } from "react-router-dom";
import { useCurrentUser } from "../../auth/currentUser";

// Admin-only items are management screens; a salesperson keeps only their core functionality.
const navItems = [
  { to: "/inbox", label: "Inbox", icon: "💬", adminOnly: false },
  { to: "/customers", label: "Customers", icon: "👤", adminOnly: false },
  { to: "/sales-users", label: "Sales Users", icon: "🧑‍💼", adminOnly: true },
  { to: "/whatsapp-numbers", label: "WhatsApp Numbers", icon: "📱", adminOnly: true },
  { to: "/simulate", label: "Simulate", icon: "🛠️", adminOnly: true },
];

export function AppLayout() {
  const { salesUsers, currentUserId, currentUser, role, isAdmin, setCurrentUserId } = useCurrentUser();
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-whatsapp-panel">
      <nav className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-whatsapp-teal text-white">
        <div className="px-4 py-5">
          <h1 className="text-lg font-semibold leading-tight">CRM Inbox</h1>
          <p className="text-xs text-white/70">WhatsApp integration</p>
        </div>
        <div className="flex-1 space-y-1 px-2">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* No real login in this POC: pick the current user. Role (and Admin status) comes from
            the backend (SalesUserDto.role); it is never derived from a hard-coded id. */}
        <div className="border-t border-white/10 px-3 py-3">
          <label
            htmlFor="current-user-select"
            className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-white/60"
          >
            Logged in as
          </label>
          <select
            id="current-user-select"
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="w-full rounded-md border border-white/20 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-white/40"
          >
            <option value="">Select user…</option>
            {salesUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
                {user.role ? ` (${user.role})` : ""}
              </option>
            ))}
          </select>
          {currentUser && (
            <p className="mt-1 text-[11px] text-white/60">
              Role: <span className="font-medium text-white/90">{role ?? "Salesperson"}</span>
            </p>
          )}
        </div>
      </nav>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
