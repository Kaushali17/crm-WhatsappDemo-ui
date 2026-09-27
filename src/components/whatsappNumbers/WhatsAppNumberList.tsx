import { Spinner } from "../common/Spinner";
import { EmptyState } from "../common/EmptyState";
import { Button } from "../common/Button";
import type { WhatsAppBusinessNumberDto } from "../../types";

type WhatsAppNumberListProps = {
  numbers: WhatsAppBusinessNumberDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onEdit: (number: WhatsAppBusinessNumberDto) => void;
  onToggleActive: (number: WhatsAppBusinessNumberDto) => void;
  togglingId?: string;
};

export function WhatsAppNumberList({
  numbers,
  isLoading,
  isError,
  onEdit,
  onToggleActive,
  togglingId,
}: WhatsAppNumberListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return <EmptyState title="Failed to load business numbers" description="Try refreshing the page." />;
  }

  if (!numbers || numbers.length === 0) {
    return (
      <EmptyState
        title="No WhatsApp business numbers yet"
        description="Add a business number and assign it to a salesperson."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Salesperson</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">WhatsApp Number</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Phone Number ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-2 text-right font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {numbers.map((number) => (
            <tr key={number.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium text-gray-900">
                {number.salesUserName || "Unassigned"}
              </td>
              <td className="px-4 py-2 text-gray-700">{number.displayPhoneNumber}</td>
              <td className="px-4 py-2 text-gray-500">{number.phoneNumberId || "—"}</td>
              <td className="px-4 py-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    number.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {number.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="!px-2 !py-1 text-xs"
                    onClick={() => onEdit(number)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant={number.isActive ? "secondary" : "primary"}
                    className="!px-2 !py-1 text-xs"
                    disabled={togglingId === number.id}
                    onClick={() => onToggleActive(number)}
                  >
                    {togglingId === number.id
                      ? "…"
                      : number.isActive
                        ? "Deactivate"
                        : "Activate"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
