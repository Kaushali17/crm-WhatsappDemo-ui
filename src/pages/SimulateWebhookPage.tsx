import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useSimulateWebhook } from "../hooks/useWhatsapp";
import { getApiErrorMessage } from "../api/client";
import { Button } from "../components/common/Button";
import { FieldLabel, SelectInput, TextInput } from "../components/common/FormControls";
import type { MessageType } from "../types";

type FormState = {
  phoneNumber: string;
  message: string;
  messageType: MessageType;
  mediaUrl: string;
  whatsappMessageId: string;
  customerName: string;
};

const initialState: FormState = {
  phoneNumber: "",
  message: "",
  messageType: "Text",
  mediaUrl: "",
  whatsappMessageId: "",
  customerName: "",
};

export function SimulateWebhookPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const simulateWebhook = useSimulateWebhook();

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = "Phone number is required.";
    if (form.messageType === "Text" && !form.message.trim()) {
      nextErrors.message = "Message is required for text messages.";
    }
    if (form.messageType !== "Text" && !form.mediaUrl.trim()) {
      nextErrors.mediaUrl = "Media URL is required for image/document messages.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    simulateWebhook.mutate(
      {
        phoneNumber: form.phoneNumber.trim(),
        message: form.message.trim() || undefined,
        messageType: form.messageType,
        mediaUrl: form.mediaUrl.trim() || undefined,
        whatsappMessageId: form.whatsappMessageId.trim() || undefined,
        customerName: form.customerName.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Incoming message simulated. Inbox refreshed.");
            setForm(initialState);
            setErrors({});
          } else {
            toast.error(data.message || "Failed to simulate incoming message.");
          }
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-whatsapp-panel p-6">
      <h1 className="mb-1 text-xl font-semibold text-gray-900">Simulate Incoming Message</h1>
      <p className="mb-4 text-sm text-gray-500">
        Posts to <code className="rounded bg-gray-200 px-1 py-0.5">/api/whatsapp/webhook</code> to mimic an
        inbound WhatsApp message, useful for demoing the inbox without a real WhatsApp connection.
      </p>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <FieldLabel label="Phone number" htmlFor="sim-phone" required error={errors.phoneNumber} />
          <TextInput
            id="sim-phone"
            value={form.phoneNumber}
            placeholder="+15551234567"
            hasError={Boolean(errors.phoneNumber)}
            onChange={(e) => setField("phoneNumber", e.target.value)}
          />
        </div>

        <div>
          <FieldLabel label="Customer name" htmlFor="sim-customer-name" />
          <TextInput
            id="sim-customer-name"
            value={form.customerName}
            placeholder="Used only when the customer doesn't exist yet"
            onChange={(e) => setField("customerName", e.target.value)}
          />
        </div>

        <div>
          <FieldLabel label="Message type" htmlFor="sim-type" />
          <SelectInput
            id="sim-type"
            value={form.messageType}
            onChange={(e) => setField("messageType", e.target.value as MessageType)}
          >
            <option value="Text">Text</option>
            <option value="Image">Image</option>
            <option value="Document">Document</option>
          </SelectInput>
        </div>

        <div>
          <FieldLabel
            label="Message"
            htmlFor="sim-message"
            required={form.messageType === "Text"}
            error={errors.message}
          />
          <TextInput
            id="sim-message"
            value={form.message}
            hasError={Boolean(errors.message)}
            onChange={(e) => setField("message", e.target.value)}
          />
        </div>

        {form.messageType !== "Text" && (
          <div>
            <FieldLabel label="Media URL" htmlFor="sim-media" required error={errors.mediaUrl} />
            <TextInput
              id="sim-media"
              value={form.mediaUrl}
              placeholder="https://.../file"
              hasError={Boolean(errors.mediaUrl)}
              onChange={(e) => setField("mediaUrl", e.target.value)}
            />
          </div>
        )}

        <div>
          <FieldLabel label="WhatsApp message ID" htmlFor="sim-wamid" />
          <TextInput
            id="sim-wamid"
            value={form.whatsappMessageId}
            placeholder="Optional external message id"
            onChange={(e) => setField("whatsappMessageId", e.target.value)}
          />
        </div>

        <Button type="submit" disabled={simulateWebhook.isPending} className="w-full">
          {simulateWebhook.isPending ? "Sending..." : "Simulate incoming message"}
        </Button>
      </form>
    </div>
  );
}
