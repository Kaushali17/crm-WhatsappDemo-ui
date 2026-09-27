import { Spinner } from "../common/Spinner";
import { EmptyState } from "../common/EmptyState";
import type { SalesUserDto } from "../../types";

type SalesUserListProps = {
  salesUsers: SalesUserDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
};

export function SalesUserList({ salesUsers, isLoading, isError }: SalesUserListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return <EmptyState title="Failed to load sales users" description="Try refreshing the page." />;
  }

  if (!salesUsers || salesUsers.length === 0) {
    return <EmptyState title="No sales users yet" description="Add a sales user to assign conversations." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Email</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">WhatsApp Number</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {salesUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium text-gray-900">{user.name}</td>
              <td className="px-4 py-2 text-gray-600">{user.email}</td>
              <td className="px-4 py-2 text-gray-600">
                {user.whatsAppDisplayPhoneNumber ? (
                  <span className={user.whatsAppBusinessNumberActive === false ? "text-gray-400" : ""}>
                    {user.whatsAppDisplayPhoneNumber}
                    {user.whatsAppBusinessNumberActive === false && " (inactive)"}
                  </span>
                ) : (
                  <span className="text-gray-400">Not assigned</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
