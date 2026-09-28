import { useMemo, useState } from "react";
import { Spinner } from "../common/Spinner";
import { SelectInput } from "../common/FormControls";
import { useWhatsAppNumbers } from "../../hooks/useWhatsappBusinessNumbers";
import { getApiErrorMessage } from "../../api/client";

type WhatsAppNumberSelectorProps = {
  // When known, preselect the number assigned to this salesperson.
  assignedUserId?: string | null;
};

// Displays the CRM's active WhatsApp Business number(s) from GET /api/whatsapp/numbers.
// One number -> read-only text; multiple -> a dropdown (ready for future numbers). The value
// is display-only: the backend decides which number/Phone Number ID to send from.
export function WhatsAppNumberSelector({ assignedUserId }: WhatsAppNumberSelectorProps) {
  const numbersQuery = useWhatsAppNumbers();
  const [selectedId, setSelectedId] = useState<string>("");

  const activeNumbers = useMemo(
    () => (numbersQuery.data ?? []).filter((n) => n.isActive),
    [numbersQuery.data]
  );

  if (numbersQuery.isLoading) {
    return <Spinner size="sm" />;
  }

  if (numbersQuery.isError) {
    return (
      <p className="text-sm text-red-600">
        Could not load WhatsApp numbers. {getApiErrorMessage(numbersQuery.error)}
      </p>
    );
  }

  if (activeNumbers.length === 0) {
    return <p className="text-sm text-gray-500">No active WhatsApp Business number.</p>;
  }

  if (activeNumbers.length === 1) {
    return <p className="text-sm text-gray-700">{activeNumbers[0].displayPhoneNumber}</p>;
  }

  // Prefer the salesperson's assigned number, then the user's pick, then the first active.
  const assignedNumber = assignedUserId
    ? activeNumbers.find((n) => n.assignedUserId === assignedUserId)
    : undefined;
  const effectiveId = selectedId || assignedNumber?.id || activeNumbers[0].id;

  return (
    <SelectInput value={effectiveId} onChange={(e) => setSelectedId(e.target.value)}>
      {activeNumbers.map((n) => (
        <option key={n.id} value={n.id}>
          {n.displayPhoneNumber}
        </option>
      ))}
    </SelectInput>
  );
}
