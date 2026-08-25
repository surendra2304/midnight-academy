import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { formatToIST } from "@/lib/format";
import { Bell, Check, Loader2 } from "lucide-react";
import { fetchNotifications, markAsRead, markAllAsRead } from "@/lib/notifications.functions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationsMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(),
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => markAsRead({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (old: Array<{ is_read: boolean }> | undefined) =>
        old ? old.map((n) => ({ ...n, is_read: true })) : [],
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                markAllRead.mutate();
              }}
              disabled={markAllRead.isPending}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={"flex flex-col items-start gap-1 p-3 cursor-pointer "}
                onClick={() => {
                  if (!n.is_read) markRead.mutate(n.id);
                  if (n.link) {
                    navigate({ to: n.link, reloadDocument: false } as never);
                  }
                }}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-semibold">{n.title}</span>
                  {!n.is_read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                <span className="text-[10px] text-muted-foreground/60">
                  {formatToIST(n.created_at)}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
