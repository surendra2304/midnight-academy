import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Wordmark } from "@/components/brand";
import { NotificationsMenu } from "@/components/notifications-menu";
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

const studentNav: NavItem[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Practice", to: "/practice" },
  { label: "History", to: "/history" },
  { label: "Progress", to: "/progress" },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin" },
  { label: "Tests", to: "/admin/tests" },
  { label: "Create Test", to: "/admin/create" },
  { label: "Students", to: "/admin/students" },
  { label: "Analytics", to: "/admin/analytics" },
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
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-surface-2 font-semibold text-foreground"
                : "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground",
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
  const navigate = useNavigate();
  const isAdmin = admin ?? user?.role === "ADMIN";

  const displayName = user?.fullName || (isAdmin ? "Instructor" : "Student");
  const email = user?.email || "";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || (isAdmin ? "IN" : "ST");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5 text-left transition-colors hover:border-border-strong">
        <span className="grid size-7 place-items-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
          {initials}
        </span>
        <span className="hidden text-sm font-medium text-foreground sm:block">
          {displayName.split(" ")[0]}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin ? null : (
          <>
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className="size-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <Settings className="size-4" /> Settings
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="mr-2 size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppNav({ admin }: { admin?: boolean | undefined }) {
  const { user } = useAuth();
  const isAdmin = admin ?? user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-5 py-3 lg:px-8">
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="shrink-0">
          <Wordmark suffix={isAdmin ? "Admin" : undefined} />
        </Link>
        <div className="mx-auto hidden lg:block">
          <NavLinks items={isAdmin ? adminNav : studentNav} />
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div className="hidden sm:block">
            <NotificationsMenu />
          </div>
          <ProfileMenu admin={isAdmin} />
        </div>
      </div>
      <div className="border-t border-border px-3 py-2 lg:hidden">
        <NavLinks items={isAdmin ? adminNav : studentNav} />
      </div>
    </header>
  );
}
