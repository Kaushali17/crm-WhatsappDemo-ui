import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CustomerTable } from "../components/customers/CustomerTable";
import { CustomerFormModal, type CustomerFormValues } from "../components/customers/CustomerFormModal";
import { SendMessageModal } from "../components/customers/SendMessageModal";
import { Button } from "../components/common/Button";
import { useCreateCustomer, useCustomers, useUpdateCustomer } from "../hooks/useCustomers";
import { useCurrentUser } from "../auth/currentUser";
import { getApiErrorMessage } from "../api/client";
import type { CustomerDto } from "../types";

export function CustomersPage() {
  const navigate = useNavigate();
  // Admin sees all customers; a salesperson is scoped to their own (backend enforces this).
  const { conversationScopeUserId } = useCurrentUser();
  const customersQuery = useCustomers(conversationScopeUserId);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerDto | undefined>(undefined);
  const [messageCustomer, setMessageCustomer] = useState<CustomerDto | undefined>(undefined);

  const openAddModal = () => {
    setEditingCustomer(undefined);
    setModalOpen(true);
  };

  const openEditModal = (customer: CustomerDto) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleMessageSent = (conversationId: string | undefined) => {
    setMessageCustomer(undefined);
    // Open the conversation the backend created/updated so the sent message is visible.
    navigate(conversationId ? `/inbox?conversationId=${conversationId}` : "/inbox");
  };

  const handleSubmit = (values: CustomerFormValues) => {
    const payload = {
      name: values.name.trim(),
      whatsAppNumber: values.whatsAppNumber.trim(),
      assignedUserId: values.assignedUserId || undefined,
    };

    if (editingCustomer) {
      updateCustomer.mutate(
        { id: editingCustomer.id, payload },
        {
          onSuccess: () => {
            toast.success("Customer updated");
            setModalOpen(false);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
    } else {
      createCustomer.mutate(payload, {
        onSuccess: () => {
          toast.success("Customer created");
          setModalOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      });
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-whatsapp-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
        <Button onClick={openAddModal}>+ Add Customer</Button>
      </div>

      <CustomerTable
        customers={customersQuery.data}
        isLoading={customersQuery.isLoading}
        isError={customersQuery.isError}
        onEdit={openEditModal}
        onSendMessage={setMessageCustomer}
      />

      {modalOpen && (
        <CustomerFormModal
          open={modalOpen}
          title={editingCustomer ? "Edit Customer" : "Add Customer"}
          initialValues={editingCustomer}
          isSubmitting={createCustomer.isPending || updateCustomer.isPending}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {messageCustomer && (
        <SendMessageModal
          open={Boolean(messageCustomer)}
          customer={messageCustomer}
          onClose={() => setMessageCustomer(undefined)}
          onSent={handleMessageSent}
        />
      )}
    </div>
  );
}
