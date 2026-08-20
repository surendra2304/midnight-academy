import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppNav } from "@/components/app-nav";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => requireAuth({ role: "ADMIN", location }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen">
      <AppNav admin />
      <Outlet />
    </div>
  );
}
