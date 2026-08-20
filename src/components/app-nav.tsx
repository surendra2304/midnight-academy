import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Wordmark } from "@/components/brand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { studentProfile } from "@/lib/mock-data";
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
  { label: "Question Bank", to: "/admin/question-bank" },
  { label: "Students", to: "/admin/students" },
  { label: "Analytics", to: "/admin/analytics" },
  { label: "Review Queue", to: "/admin/review" },
];

function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {items.map((item) => {
        const active =
          item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
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
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5 text-left transition-colors hover:border-border-strong">
        <span className="grid size-7 place-items-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
          {admin ? "RK" : studentProfile.initials}
        </span>
        <span className="hidden text-sm font-medium text-foreground sm:block">
          {admin ? "R. Kaur" : studentProfile.name.split(" ")[0]}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {admin ? "admin@midnight.academy" : studentProfile.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {admin ? null : (
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
        <DropdownMenuItem onClick={async () => {
          await signOut();
          navigate({ to: "/auth" });
        }}>
          <LogOut className="mr-2 size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppNav({ admin }: { admin?: boolean | undefined }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-5 py-3 lg:px-8">
        <Link to={admin ? "/admin" : "/dashboard"} className="shrink-0">
          <Wordmark suffix={admin ? "Admin" : undefined} />
        </Link>
        <div className="mx-auto hidden lg:block">
          <NavLinks items={admin ? adminNav : studentNav} />
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button
            className="relative hidden size-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground sm:grid"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
          </button>
          <ProfileMenu admin={admin} />
        </div>
      </div>
      <div className="border-t border-border px-3 py-2 lg:hidden">
        <NavLinks items={admin ? adminNav : studentNav} />
      </div>
    </header>
  );
}
