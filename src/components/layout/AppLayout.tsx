import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/inbox", label: "Inbox", icon: "💬" },
  { to: "/customers", label: "Customers", icon: "👤" },
  { to: "/sales-users", label: "Sales Users", icon: "🧑‍💼" },
  { to: "/simulate", label: "Simulate", icon: "🛠️" },
];

export function AppLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-whatsapp-panel">
      <nav className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-whatsapp-teal text-white">
        <div className="px-4 py-5">
          <h1 className="text-lg font-semibold leading-tight">CRM Inbox</h1>
          <p className="text-xs text-white/70">WhatsApp integration</p>
        </div>
        <div className="flex-1 space-y-1 px-2">
          {navItems.map((item) => (
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
        <div className="px-4 py-4 text-xs text-white/50">Mock WhatsApp CRM · v1</div>
      </nav>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
