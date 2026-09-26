import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { FieldLabel, TextInput } from "../common/FormControls";

export type SalesUserFormValues = {
  name: string;
  email: string;
};

type SalesUserFormModalProps = {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: SalesUserFormValues) => void;
};

const emptyValues: SalesUserFormValues = { name: "", email: "" };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The parent only mounts this component while `open` is true, so state naturally
// resets on every open — no reset effect needed.
export function SalesUserFormModal({ open, isSubmitting, onClose, onSubmit }: SalesUserFormModalProps) {
  const [values, setValues] = useState<SalesUserFormValues>(emptyValues);
  const [errors, setErrors] = useState<Partial<SalesUserFormValues>>({});

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};
    if (!values.name.trim()) nextErrors.name = "Name is required.";
    if (!values.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <Modal open={open} title="Add Sales User" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <FieldLabel label="Name" htmlFor="sales-user-name" required error={errors.name} />
          <TextInput
            id="sales-user-name"
            value={values.name}
            hasError={Boolean(errors.name)}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
        </div>
        <div>
          <FieldLabel label="Email" htmlFor="sales-user-email" required error={errors.email} />
          <TextInput
            id="sales-user-email"
            type="email"
            value={values.email}
            hasError={Boolean(errors.email)}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />
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
