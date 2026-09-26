import { useState } from "react";
import toast from "react-hot-toast";
import { SalesUserList } from "../components/salesUsers/SalesUserList";
import { SalesUserFormModal, type SalesUserFormValues } from "../components/salesUsers/SalesUserFormModal";
import { Button } from "../components/common/Button";
import { useCreateSalesUser, useSalesUsers } from "../hooks/useSalesUsers";
import { getApiErrorMessage } from "../api/client";

export function SalesUsersPage() {
  const salesUsersQuery = useSalesUsers();
  const createSalesUser = useCreateSalesUser();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = (values: SalesUserFormValues) => {
    createSalesUser.mutate(
      { name: values.name.trim(), email: values.email.trim() },
      {
        onSuccess: () => {
          toast.success("Sales user created");
          setModalOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-whatsapp-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Sales Users</h1>
        <Button onClick={() => setModalOpen(true)}>+ Add Sales User</Button>
      </div>

      <SalesUserList
        salesUsers={salesUsersQuery.data}
        isLoading={salesUsersQuery.isLoading}
        isError={salesUsersQuery.isError}
      />

      {modalOpen && (
        <SalesUserFormModal
          open={modalOpen}
          isSubmitting={createSalesUser.isPending}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
