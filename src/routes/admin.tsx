import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Console — Pocket Lawyer AI" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RequireAdmin>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </RequireAdmin>
  );
}
