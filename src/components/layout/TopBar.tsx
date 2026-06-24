import { cn } from "@/lib/utils";
import { RoleBadge } from "@/components/ayura/RoleBadge";
import type { AppRole } from "@/components/ayura/RoleBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Wifi, WifiOff, ChevronDown, Clock } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  currentRole?: AppRole | null;
  pendingSync?: number;
  lastSync?: string;
  onSync?: () => void;
  onRoleMenu?: () => void;
  className?: string;
}

export function TopBar({
  title,
  subtitle,
  currentRole,
  pendingSync = 0,
  lastSync,
  onSync,
  onRoleMenu,
  className,
}: TopBarProps) {
  const hasSync = pendingSync > 0;

  return (
    <header
      className={cn(
        "flex items-center justify-between px-5 py-3 bg-card border-b border-border shrink-0",
        className,
      )}
    >
      {/* Left: title */}
      <div className="flex flex-col">
        <h1 className="font-display font-semibold text-xl text-foreground leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Sync indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {hasSync ? (
            <>
              <WifiOff className="size-3.5 text-amber-500" />
              <Badge
                variant="outline"
                className="text-xs border-amber-200 text-amber-700 bg-amber-50 gap-1"
              >
                {pendingSync} pending
              </Badge>
            </>
          ) : (
            <>
              <Wifi className="size-3.5 text-emerald-500" />
              {lastSync && (
                <span className="hidden sm:flex items-center gap-1">
                  <Clock className="size-3" />
                  {lastSync}
                </span>
              )}
            </>
          )}
        </div>

        {/* Sync button */}
        {onSync && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            className="gap-1.5 h-8 text-xs"
          >
            <RefreshCw className="size-3.5" />
            Sync
          </Button>
        )}

        {/* Role badge + menu */}
        {currentRole && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-muted transition-colors"
                onClick={onRoleMenu}
              >
                <RoleBadge role={currentRole} size="sm" />
                <ChevronDown className="size-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Lock session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
