import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Wordmark } from "@/components/brand";
import { NotificationsMenu } from "@/components/notifications-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type NavItem = { label: string; to: string };

const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin" },
  { label: "Tests & Blueprints", to: "/admin/tests" },
  { label: "Content Studio", to: "/admin/create" },
  { label: "Students", to: "/admin/students" },
  { label: "Platform Analytics", to: "/admin/analytics" },
];

function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="no-scrollbar flex items-center gap-1 overflow-x-auto">
      {items.map((item) => {
        const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 font-semibold text-primary"
                : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ProfileMenu({ admin }: { admin?: boolean | undefined }) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex size-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200">
            <User className="size-4 text-blue-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-lg text-slate-800">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-xs font-semibold leading-none text-slate-900">
                {user?.fullName || "Learner"}
              </p>
              <p className="text-[10px] leading-none text-slate-500">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer text-xs">
              Student Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center gap-2 cursor-pointer text-xs">
              Profile &amp; Target Score
            </Link>
          </DropdownMenuItem>
          {admin ? (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-xs">
                Admin Studio
              </Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="flex items-center gap-2 text-rose-600 cursor-pointer text-xs"
          >
            <LogOut className="size-3.5" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function AppNav({ admin }: { admin?: boolean } = {}) {
  const { user } = useAuth();
  const isAdmin = admin !== undefined ? admin : user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs select-none">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          {/* Logo & TOEFL Subtitle (TestGlider Header Screen 0) */}
          <div className="flex items-center gap-3">
            <Link to="/test" className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 -rotate-45 ml-0.5">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>
              <span className="text-base font-black tracking-tight text-slate-900">
                Midnight Academy
              </span>
            </Link>
            <span className="text-[13px] font-semibold text-slate-400">TOEFL</span>
          </div>

          {/* Right Header Navigation: Reviews, Blog, Community, Purchase, Profile */}
          <div className="flex items-center gap-6">
            <Link
              to="/lessons"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Reviews
            </Link>
            <Link
              to="/lessons"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Community
            </Link>

            <ProfileMenu admin={false} />
          </div>
        </div>
      </header>
    );
  }

  // Admin Header
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Wordmark />
          </Link>
          <NavLinks items={adminNav} />
        </div>
        <ProfileMenu admin={true} />
      </div>
    </header>
  );
}
