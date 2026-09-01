import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
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
  { label: "Test Catalog", to: "/test" },
  { label: "Vocabulary", to: "/vocabulary" },
  { label: "Dictation", to: "/dictation" },
  { label: "Shadowing", to: "/shadowing" },
  { label: "Practice Queue", to: "/practice" },
  { label: "Score History", to: "/history" },
  { label: "Skill Analytics", to: "/progress" },
];

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
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="size-9 rounded-lg text-muted-foreground hover:bg-surface-2 hover:text-foreground"
        title="Toggle Theme"
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>

      <NotificationsMenu />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-2">
            <User className="size-3.5 text-primary" />
            <span className="max-w-[120px] truncate">{user?.name || "Learner"}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-xs font-semibold leading-none text-foreground">{user?.name}</p>
              <p className="text-[10px] leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center gap-2 cursor-pointer text-xs">
              <User className="size-3.5" /> Profile & Target Score
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
          <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 text-destructive cursor-pointer text-xs">
            <LogOut className="size-3.5" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

import { Button } from "@/components/ui/button";

export function AppNav() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Wordmark />
          </Link>
          <NavLinks items={isAdmin ? adminNav : studentNav} />
        </div>
        <ProfileMenu admin={isAdmin} />
      </div>
    </header>
  );
}
