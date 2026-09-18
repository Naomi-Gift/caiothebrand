import { getUsers } from "@/lib/api";
import { auth } from "@/auth";
import UserRoleToggle from "./UserRoleToggle";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [session, users] = await Promise.all([auth(), getUsers().catch(() => [])]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      <p className="mt-1 text-sm text-gray-500">{users.length} registered user{users.length !== 1 ? "s" : ""}.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Orders</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{u.name ?? "—"}</div>
                  <div className="text-xs text-gray-400">{u.email}</div>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.role === "ADMIN" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">{u._count.orders}</td>
                <td className="px-5 py-3 text-right">
                  <UserRoleToggle userId={u.id} currentRole={u.role} isSelf={u.email === session?.user?.email} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
