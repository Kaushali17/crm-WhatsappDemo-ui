import { formatDate } from "../../utils/date";
import { Spinner } from "../common/Spinner";
import { EmptyState } from "../common/EmptyState";
import { Button } from "../common/Button";
import type { CustomerDto } from "../../types";

type CustomerTableProps = {
  customers: CustomerDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onEdit: (customer: CustomerDto) => void;
};

export function CustomerTable({ customers, isLoading, isError, onEdit }: CustomerTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return <EmptyState title="Failed to load customers" description="Try refreshing the page." />;
  }

  if (!customers || customers.length === 0) {
    return <EmptyState title="No customers yet" description="Add a customer to get started." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">WhatsApp number</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Assigned user</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Created</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium text-gray-900">{customer.name}</td>
              <td className="px-4 py-2 text-gray-600">{customer.whatsAppNumber}</td>
              <td className="px-4 py-2 text-gray-600">{customer.assignedUserName || "Unassigned"}</td>
              <td className="px-4 py-2 text-gray-600">{formatDate(customer.createdAt)}</td>
              <td className="px-4 py-2 text-right">
                <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => onEdit(customer)}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
