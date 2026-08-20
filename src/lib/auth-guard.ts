import { redirect } from "@tanstack/react-router";
import { authStore, type AppRole } from "./auth-store";

export async function requireAuth(args: { 
  role?: AppRole; 
  location: any; 
}) {
  await authStore.getRestorePromise();
  const user = authStore.getUser();
  
  // Rule: Unauthenticated users are redirected to /auth
  if (!user) {
    throw redirect({
      to: "/auth",
      search: { redirect: args.location.pathname },
    });
  }
  
  // Rule: STUDENT and ADMIN are treated as mutually exclusive experiences.
  // A student hitting an admin-only route is redirected to /dashboard.
  // An admin hitting a student-only route is redirected to /admin.
  if (args.role && user.role !== args.role) {
    throw redirect({
      to: user.role === "ADMIN" ? "/admin" : "/dashboard",
    });
  }
}

export async function requireUnauth(args: { location: any }) {
  await authStore.getRestorePromise();
  const user = authStore.getUser();
  
  // Rule: Logged-in users visiting /auth are redirected to their respective dashboard
  if (user) {
    throw redirect({
      to: user.role === "ADMIN" ? "/admin" : "/dashboard",
    });
  }
}
