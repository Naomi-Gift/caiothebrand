import { requireAdminPage } from "@/lib/adminAuth";
import { getUsers } from "@/lib/api";
import { auth } from "@/auth";
import UserRoleToggle from "./UserRoleToggle";
import BranchAccessSelect from "./BranchAccessSelect";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireAdminPage({ fullAdmin: true });
  const [session, users] = await Promise.all([auth(), getUsers().catch(() => [])]);

  return (
    <div>
      <h1 className="font-display text-4xl font-bold text-brown-darkest">Users</h1>
      <p className="mt-1 text-sm text-brown-light">{users.length} registered user{users.length !== 1 ? "s" : ""}.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-bone-dark/70 bg-crisp shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-bone bg-cream text-xs uppercase tracking-wider text-brown-light">
            <tr>
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Access</th>
              <th className="px-5 py-3 text-left">Orders</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bone">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-cream">
                <td className="px-5 py-3">
                  <div className="font-medium text-brown-darkest">{u.name ?? "—"}</div>
                  <div className="text-xs text-brown-light/80">{u.email}</div>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.role === "ADMIN" ? "bg-bone text-brown" : "bg-bone/70 text-brown-light"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {u.role === "ADMIN" ? (
                    <BranchAccessSelect userId={u.id} branchId={u.branchId} isSelf={u.email === session?.user?.email} />
                  ) : (
                    <span className="text-xs text-brown-light/80">Customer</span>
                  )}
                </td>
                <td className="px-5 py-3 text-brown-muted">{u._count.orders}</td>
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
