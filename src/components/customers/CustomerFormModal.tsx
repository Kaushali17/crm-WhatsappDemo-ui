import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { FieldLabel, SelectInput, TextInput } from "../common/FormControls";
import { useSalesUsers } from "../../hooks/useSalesUsers";
import type { CustomerDto } from "../../types";

export type CustomerFormValues = {
  name: string;
  whatsAppNumber: string;
  assignedUserId: string;
};

type CustomerFormModalProps = {
  open: boolean;
  title: string;
  initialValues?: CustomerDto;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => void;
};

const emptyValues: CustomerFormValues = { name: "", whatsAppNumber: "", assignedUserId: "" };

// The parent only mounts this component while `open` is true, so state naturally
// resets to the current `initialValues` on every open — no reset effect needed.
export function CustomerFormModal({
  open,
  title,
  initialValues,
  isSubmitting,
  onClose,
  onSubmit,
}: CustomerFormModalProps) {
  const [values, setValues] = useState<CustomerFormValues>(() =>
    initialValues
      ? {
          name: initialValues.name,
          whatsAppNumber: initialValues.whatsAppNumber,
          assignedUserId: initialValues.assignedUserId ?? "",
        }
      : emptyValues
  );
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormValues, string>>>({});
  const { data: salesUsers } = useSalesUsers();

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};
    if (!values.name.trim()) nextErrors.name = "Name is required.";
    if (!values.whatsAppNumber.trim()) nextErrors.whatsAppNumber = "WhatsApp number is required.";
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
          <FieldLabel label="Name" htmlFor="customer-name" required error={errors.name} />
          <TextInput
            id="customer-name"
            value={values.name}
            hasError={Boolean(errors.name)}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
        </div>
        <div>
          <FieldLabel
            label="WhatsApp number"
            htmlFor="customer-whatsapp"
            required
            error={errors.whatsAppNumber}
          />
          <TextInput
            id="customer-whatsapp"
            value={values.whatsAppNumber}
            placeholder="+15551234567"
            hasError={Boolean(errors.whatsAppNumber)}
            onChange={(e) => setValues((v) => ({ ...v, whatsAppNumber: e.target.value }))}
          />
        </div>
        <div>
          <FieldLabel label="Assigned sales user" htmlFor="customer-assigned" />
          <SelectInput
            id="customer-assigned"
            value={values.assignedUserId}
            onChange={(e) => setValues((v) => ({ ...v, assignedUserId: e.target.value }))}
          >
            <option value="">Unassigned</option>
            {salesUsers?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </SelectInput>
        </div>
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
