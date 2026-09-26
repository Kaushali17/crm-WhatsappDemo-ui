import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { InboxPage } from "./pages/InboxPage";
import { CustomersPage } from "./pages/CustomersPage";
import { SalesUsersPage } from "./pages/SalesUsersPage";
import { SimulateWebhookPage } from "./pages/SimulateWebhookPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/inbox" replace />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/sales-users" element={<SalesUsersPage />} />
        <Route path="/simulate" element={<SimulateWebhookPage />} />
        <Route path="*" element={<Navigate to="/inbox" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
