import { useState } from "react";
import toast from "react-hot-toast";
import { WhatsAppNumberList } from "../components/whatsappNumbers/WhatsAppNumberList";
import {
  WhatsAppNumberFormModal,
  type WhatsAppNumberFormValues,
} from "../components/whatsappNumbers/WhatsAppNumberFormModal";
import { Button } from "../components/common/Button";
import {
  useCreateWhatsAppBusinessNumber,
  useUpdateWhatsAppBusinessNumber,
  useWhatsAppBusinessNumbers,
} from "../hooks/useWhatsappBusinessNumbers";
import { getApiErrorMessage } from "../api/client";
import type { WhatsAppBusinessNumberDto } from "../types";

export function WhatsAppNumbersPage() {
  const numbersQuery = useWhatsAppBusinessNumbers();
  const createNumber = useCreateWhatsAppBusinessNumber();
  const updateNumber = useUpdateWhatsAppBusinessNumber();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WhatsAppBusinessNumberDto | undefined>(undefined);
  const [togglingId, setTogglingId] = useState<string | undefined>(undefined);

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (number: WhatsAppBusinessNumberDto) => {
    setEditing(number);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(undefined);
  };

  const handleSubmit = (values: WhatsAppNumberFormValues) => {
    const payload = {
      salesUserId: values.salesUserId,
      displayPhoneNumber: values.displayPhoneNumber.trim(),
      phoneNumberId: values.phoneNumberId.trim() || undefined,
      isActive: values.isActive,
    };

    if (editing) {
      updateNumber.mutate(
        { id: editing.id, payload },
        {
          onSuccess: () => {
            toast.success("Business number updated");
            closeModal();
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
    } else {
      createNumber.mutate(payload, {
        onSuccess: () => {
          toast.success("Business number added");
          closeModal();
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      });
    }
  };

  const handleToggleActive = (number: WhatsAppBusinessNumberDto) => {
    setTogglingId(number.id);
    updateNumber.mutate(
      {
        id: number.id,
        payload: {
          salesUserId: number.salesUserId ?? "",
          displayPhoneNumber: number.displayPhoneNumber,
          phoneNumberId: number.phoneNumberId,
          isActive: !number.isActive,
        },
      },
      {
        onSuccess: () => toast.success(number.isActive ? "Number deactivated" : "Number activated"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSettled: () => setTogglingId(undefined),
      }
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-whatsapp-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">WhatsApp Business Numbers</h1>
          <p className="text-sm text-gray-500">
            Assign each salesperson their own WhatsApp Business number. Meta credentials are handled by
            the backend.
          </p>
        </div>
        <Button onClick={openCreate}>+ Add Business Number</Button>
      </div>

      <WhatsAppNumberList
        numbers={numbersQuery.data}
        isLoading={numbersQuery.isLoading}
        isError={numbersQuery.isError}
        onEdit={openEdit}
        onToggleActive={handleToggleActive}
        togglingId={togglingId}
      />

      {modalOpen && (
        <WhatsAppNumberFormModal
          open={modalOpen}
          title={editing ? "Edit Business Number" : "Add Business Number"}
          initialValues={editing}
          isSubmitting={createNumber.isPending || updateNumber.isPending}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
