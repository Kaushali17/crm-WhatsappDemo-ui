import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes } from "react";

type FieldWrapperProps = {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
} & LabelHTMLAttributes<HTMLLabelElement>;

export function FieldLabel({ label, htmlFor, error, required, ...rest }: FieldWrapperProps) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700" {...rest}>
      {label}
      {required && <span className="text-red-500"> *</span>}
      {error && <span className="ml-2 text-xs font-normal text-red-500">{error}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  const { hasError, className = "", ...rest } = props;
  return (
    <input
      className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-whatsapp-teal/40 ${
        hasError ? "border-red-400" : "border-gray-300"
      } ${className}`}
      {...rest}
    />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }) {
  const { hasError, className = "", children, ...rest } = props;
  return (
    <select
      className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-whatsapp-teal/40 ${
        hasError ? "border-red-400" : "border-gray-300"
      } ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
