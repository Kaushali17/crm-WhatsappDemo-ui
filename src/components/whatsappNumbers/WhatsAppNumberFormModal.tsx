import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { FieldLabel, SelectInput, TextInput } from "../common/FormControls";
import { useSalesUsers } from "../../hooks/useSalesUsers";
import type { WhatsAppBusinessNumberDto } from "../../types";

export type WhatsAppNumberFormValues = {
  salesUserId: string;
  displayPhoneNumber: string;
  phoneNumberId: string;
  isActive: boolean;
};

type WhatsAppNumberFormModalProps = {
  open: boolean;
  title: string;
  initialValues?: WhatsAppBusinessNumberDto;
  // When true, the Phone Number ID field is required (backend requires it).
  requirePhoneNumberId?: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: WhatsAppNumberFormValues) => void;
};

const emptyValues: WhatsAppNumberFormValues = {
  salesUserId: "",
  displayPhoneNumber: "",
  phoneNumberId: "",
  isActive: true,
};

// The parent only mounts this component while `open` is true, so state naturally
// resets to the current `initialValues` on every open — no reset effect needed.
export function WhatsAppNumberFormModal({
  open,
  title,
  initialValues,
  requirePhoneNumberId = false,
  isSubmitting,
  onClose,
  onSubmit,
}: WhatsAppNumberFormModalProps) {
  const [values, setValues] = useState<WhatsAppNumberFormValues>(() =>
    initialValues
      ? {
          salesUserId: initialValues.salesUserId ?? "",
          displayPhoneNumber: initialValues.displayPhoneNumber,
          phoneNumberId: initialValues.phoneNumberId ?? "",
          isActive: initialValues.isActive,
        }
      : emptyValues
  );
  const [errors, setErrors] = useState<Partial<Record<keyof WhatsAppNumberFormValues, string>>>({});
  const { data: salesUsers } = useSalesUsers();

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};
    if (!values.salesUserId) nextErrors.salesUserId = "Salesperson is required.";
    if (!values.displayPhoneNumber.trim()) nextErrors.displayPhoneNumber = "Phone number is required.";
    if (requirePhoneNumberId && !values.phoneNumberId.trim()) {
      nextErrors.phoneNumberId = "Phone Number ID is required.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <FieldLabel label="Salesperson" htmlFor="wa-sales-user" required error={errors.salesUserId} />
          <SelectInput
            id="wa-sales-user"
            value={values.salesUserId}
            hasError={Boolean(errors.salesUserId)}
            onChange={(e) => setValues((v) => ({ ...v, salesUserId: e.target.value }))}
          >
            <option value="" disabled>
              Select salesperson
            </option>
            {salesUsers?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </SelectInput>
        </div>
        <div>
          <FieldLabel
            label="WhatsApp number"
            htmlFor="wa-display-number"
            required
            error={errors.displayPhoneNumber}
          />
          <TextInput
            id="wa-display-number"
            value={values.displayPhoneNumber}
            placeholder="+15551234567"
            hasError={Boolean(errors.displayPhoneNumber)}
            onChange={(e) => setValues((v) => ({ ...v, displayPhoneNumber: e.target.value }))}
          />
        </div>
        <div>
          <FieldLabel
            label="Phone Number ID"
            htmlFor="wa-phone-number-id"
            required={requirePhoneNumberId}
            error={errors.phoneNumberId}
          />
          <TextInput
            id="wa-phone-number-id"
            value={values.phoneNumberId}
            placeholder="Meta Phone Number ID (non-secret)"
            hasError={Boolean(errors.phoneNumberId)}
            onChange={(e) => setValues((v) => ({ ...v, phoneNumberId: e.target.value }))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-whatsapp-teal focus:ring-whatsapp-teal/40"
          />
          Active
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
