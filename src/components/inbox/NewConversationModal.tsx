import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Spinner } from "../common/Spinner";
import { EmptyState } from "../common/EmptyState";
import { FieldLabel, SelectInput, TextInput } from "../common/FormControls";
import { CustomerFormModal, type CustomerFormValues } from "../customers/CustomerFormModal";
import { useCustomers, useCreateCustomer } from "../../hooks/useCustomers";
import { useSendTemplateMessage, useWhatsAppTemplates } from "../../hooks/useWhatsapp";
import { useWhatsAppBusinessNumbers } from "../../hooks/useWhatsappBusinessNumbers";
import { useCurrentUser } from "../../auth/currentUser";
import { getApiErrorMessage } from "../../api/client";
import type { CustomerDto, WhatsAppTemplateDto } from "../../types";

type NewConversationModalProps = {
  open: boolean;
  onClose: () => void;
  // Called after the backend accepts the template; receives the created conversation id (if any)
  // so the inbox can select and open the new conversation.
  onCreated: (conversationId: string | undefined) => void;
};

// Returns the BODY component's text for a template, where {{n}} placeholders live.
function getTemplateBodyText(template: WhatsAppTemplateDto): string {
  const body = template.components?.find((c) => c.type?.toUpperCase() === "BODY");
  return body?.text ?? "";
}

// Extracts the distinct {{n}} placeholder numbers from the template body, in ascending order.
// The number and order of parameter inputs is driven entirely by the backend's template text.
function getPlaceholderIndexes(text: string): number[] {
  const found = new Set<number>();
  const regex = /\{\{\s*(\d+)\s*\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    found.add(Number(match[1]));
  }
  return [...found].sort((a, b) => a - b);
}

// The parent only mounts this while `open` is true, so all local state resets naturally per
// open. Default selections are computed inline (never via effects) to satisfy the react-hooks
// set-state-in-effect rule used in this project.
export function NewConversationModal({ open, onClose, onCreated }: NewConversationModalProps) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedSalesUserId, setSelectedSalesUserId] = useState("");
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  // Keyed by `${templateName}:${index}` so switching template preserves per-template edits and
  // never needs a reset effect.
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  const customersQuery = useCustomers();
  const templatesQuery = useWhatsAppTemplates();
  const businessNumbersQuery = useWhatsAppBusinessNumbers();
  const sendTemplate = useSendTemplateMessage();
  const createCustomer = useCreateCustomer();
  const { currentUser } = useCurrentUser();

  const customers = customersQuery.data;
  // Salesperson -> WhatsApp Business number mapping. Only active numbers with a salesperson can
  // be picked; the backend maps the chosen salesUserId to the PhoneNumberId to send from.
  const businessNumbers = (businessNumbersQuery.data ?? []).filter(
    (n) => n.isActive && n.salesUserId
  );
  // Only templates the backend reports as APPROVED can be sent via Meta.
  const approvedTemplates = (templatesQuery.data ?? []).filter(
    (t) => t.status?.toUpperCase() === "APPROVED"
  );

  const effectiveTemplateName = selectedTemplateName || approvedTemplates[0]?.name || "";
  const selectedTemplate: WhatsAppTemplateDto | undefined = approvedTemplates.find(
    (t) => t.name === effectiveTemplateName
  );
  const selectedCustomer: CustomerDto | undefined = customers?.find((c) => c.id === selectedCustomerId);

  // Default to the current user's number if they have one, else the first active number.
  // Computed inline (no reset effects).
  const currentUserHasNumber = businessNumbers.some((n) => n.salesUserId === currentUser?.id);
  const effectiveSalesUserId =
    selectedSalesUserId ||
    (currentUserHasNumber ? currentUser?.id : undefined) ||
    businessNumbers[0]?.salesUserId ||
    "";

  const bodyText = selectedTemplate ? getTemplateBodyText(selectedTemplate) : "";
  const placeholderIndexes = getPlaceholderIndexes(bodyText);

  const term = customerSearch.trim().toLowerCase();
  const filteredCustomers = (customers ?? []).filter((c) => {
    if (!term) return true;
    return [c.name, c.whatsAppNumber].some((v) => v?.toLowerCase().includes(term));
  });

  const paramKey = (index: number) => `${effectiveTemplateName}:${index}`;
  const paramValue = (index: number) => paramValues[paramKey(index)] ?? "";
  const setParamValue = (index: number, value: string) =>
    setParamValues((prev) => ({ ...prev, [paramKey(index)]: value }));

  const handleCreateCustomer = (values: CustomerFormValues) => {
    createCustomer.mutate(
      {
        name: values.name.trim(),
        whatsAppNumber: values.whatsAppNumber.trim(),
        assignedUserId: values.assignedUserId || undefined,
      },
      {
        onSuccess: (customer) => {
          setSelectedCustomerId(customer.id);
          setCustomerSearch("");
          setShowCreateCustomer(false);
          toast.success("Customer created");
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleSend = () => {
    if (!selectedCustomer) {
      toast.error("Select a customer first.");
      return;
    }
    if (!selectedCustomer.whatsAppNumber?.trim()) {
      toast.error("The selected customer has no WhatsApp number.");
      return;
    }
    if (!selectedTemplate) {
      toast.error("Select an approved template.");
      return;
    }
    if (businessNumbers.length > 0 && !effectiveSalesUserId) {
      toast.error("Select a salesperson.");
      return;
    }
    const missing = placeholderIndexes.find((i) => !paramValue(i).trim());
    if (missing !== undefined) {
      toast.error(`Fill in the value for {{${missing}}}.`);
      return;
    }

    sendTemplate.mutate(
      {
        // customerId (not a raw phone number); backend resolves the number + business sender.
        customerId: selectedCustomer.id,
        conversationId: null,
        whatsAppBusinessNumberId: null,
        // Backend maps this salesperson to their WhatsApp Business number / PhoneNumberId.
        salesUserId: effectiveSalesUserId || null,
        templateName: selectedTemplate.name,
        languageCode: selectedTemplate.languageCode,
        // Ordered exactly by the template's {{n}} placeholders.
        parameters: placeholderIndexes.map((i) => ({ type: "text" as const, text: paramValue(i).trim() })),
      },
      {
        onSuccess: (data) => {
          if (data.success === false) {
            toast.error(data.message || "Unable to start the conversation.");
            return;
          }
          toast.success("Template sent");
          onCreated(data.conversation?.id);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const isSending = sendTemplate.isPending;

  return (
    <>
      <Modal open={open} title="New Conversation" onClose={onClose}>
        <div className="space-y-4">
          {/* Customer selection */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <FieldLabel label="Customer" htmlFor="new-conv-customer-search" required />
              <button
                type="button"
                onClick={() => setShowCreateCustomer(true)}
                className="text-xs font-medium text-whatsapp-teal hover:underline"
              >
                + New customer
              </button>
            </div>
            <TextInput
              id="new-conv-customer-search"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search by name or number..."
              className="mb-2"
            />
            {customersQuery.isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : customersQuery.isError ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                Failed to load customers. Try again.
              </p>
            ) : (
              <SelectInput
                aria-label="Select customer"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Select a customer…</option>
                {filteredCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.whatsAppNumber || "no number"}
                  </option>
                ))}
              </SelectInput>
            )}

            {selectedCustomer && (
              <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                <p className="text-gray-600">
                  WhatsApp:{" "}
                  {selectedCustomer.whatsAppNumber ? (
                    selectedCustomer.whatsAppNumber
                  ) : (
                    <span className="text-red-500">Not set</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Salesperson selection — maps salesperson -> WhatsApp Business number.
              The backend uses the chosen salesUserId to decide which PhoneNumberId to send from. */}
          <div>
            <FieldLabel label="Salesperson" htmlFor="new-conv-salesperson" required />
            {businessNumbersQuery.isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : businessNumbersQuery.isError ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                Failed to load WhatsApp Business numbers. Try again.
              </p>
            ) : businessNumbers.length === 0 ? (
              <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">
                No active WhatsApp Business numbers. The backend will pick the sender.
              </p>
            ) : (
              <SelectInput
                id="new-conv-salesperson"
                value={effectiveSalesUserId}
                onChange={(e) => setSelectedSalesUserId(e.target.value)}
              >
                {businessNumbers.map((n) => (
                  <option key={n.id} value={n.salesUserId}>
                    {n.salesUserName ?? "Unassigned"} → {n.displayPhoneNumber}
                  </option>
                ))}
              </SelectInput>
            )}
          </div>

          {/* Template selection (real, approved-only, from the backend) */}
          <div>
            <FieldLabel label="Template" htmlFor="new-conv-template" required />
            {templatesQuery.isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : templatesQuery.isError ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                Failed to load templates from the backend. Try again.
              </p>
            ) : approvedTemplates.length === 0 ? (
              <EmptyState
                title="No approved templates"
                description="No APPROVED WhatsApp templates were returned by the backend."
              />
            ) : (
              <SelectInput
                id="new-conv-template"
                value={effectiveTemplateName}
                onChange={(e) => setSelectedTemplateName(e.target.value)}
              >
                {approvedTemplates.map((t) => (
                  <option key={`${t.name}:${t.languageCode}`} value={t.name}>
                    {t.name}
                    {t.category ? ` (${t.category})` : ""}
                  </option>
                ))}
              </SelectInput>
            )}

            {selectedTemplate && (
              <>
                <p className="mt-1 text-xs text-gray-500">
                  Language:{" "}
                  <span className="font-medium text-gray-700">{selectedTemplate.languageCode}</span>
                  <span className="mx-1 text-gray-300">·</span>
                  Status: <span className="font-medium text-green-600">{selectedTemplate.status}</span>
                </p>
                {bodyText && (
                  <p className="mt-2 whitespace-pre-line rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    {bodyText}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Parameter fields, derived from the selected template's actual body placeholders */}
          {selectedTemplate && placeholderIndexes.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Template parameters</p>
              {placeholderIndexes.map((index) => {
                const id = `new-conv-param-${index}`;
                return (
                  <div key={index}>
                    <FieldLabel label={`Value for {{${index}}}`} htmlFor={id} required />
                    <TextInput
                      id={id}
                      value={paramValue(index)}
                      placeholder={`Parameter ${index}`}
                      onChange={(e) => setParamValue(index, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={isSending || !selectedCustomer || !selectedTemplate}
            >
              {isSending ? (
                <>
                  <Spinner size="sm" className="!border-white !border-t-transparent" /> Sending...
                </>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {showCreateCustomer && (
        <CustomerFormModal
          open={showCreateCustomer}
          title="New Customer"
          isSubmitting={createCustomer.isPending}
          onClose={() => setShowCreateCustomer(false)}
          onSubmit={handleCreateCustomer}
        />
      )}
    </>
  );
}
