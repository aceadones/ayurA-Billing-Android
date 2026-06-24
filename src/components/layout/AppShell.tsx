import { useState } from "react";
import { cn } from "@/lib/utils";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";
import type { AppRole } from "@/components/ayura/RoleBadge";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  title: string;
  subtitle?: string;
  currentRole?: AppRole | null;
  pendingSync?: number;
  lastSync?: string;
  onSync?: () => void;
  onLock?: () => void;
  children: React.ReactNode;
  contentClassName?: string;
}

export function AppShell({
  title,
  subtitle,
  currentRole,
  pendingSync = 0,
  lastSync,
  onSync,
  onLock,
  children,
  contentClassName,
}: AppShellProps) {
  // Sidebar: expanded by default in landscape, collapsed in portrait
  // Users can toggle manually
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean | null>(null);

  // Determine effective collapsed state
  // null = use media query default (expanded in landscape, collapsed in portrait)
  const _isCollapsed =
    sidebarExpanded === null
      ? false // Will be overridden by CSS media queries; JS fallback is expanded
      : !sidebarExpanded;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar — full height, no scroll */}
      <div
        className={cn(
          "hidden sm:flex transition-all duration-300",
          // Portrait: collapsed by default
          "portrait:w-16",
          // Landscape: expanded by default
          "landscape:w-[220px]",
          // Manual override
          sidebarExpanded === true && "!w-[220px]",
          sidebarExpanded === false && "!w-16",
        )}
      >
        <SideNav
          collapsed={
            sidebarExpanded === null
              ? undefined // Let CSS-based portrait/landscape handle visual
              : !sidebarExpanded
          }
          currentRole={currentRole}
          onLock={onLock}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* TopBar */}
        <TopBar
          title={title}
          subtitle={subtitle}
          currentRole={currentRole}
          pendingSync={pendingSync}
          lastSync={lastSync}
          onSync={onSync}
        />

        {/* Sidebar toggle button (tablet-optimized) */}
        <div className="absolute left-0 top-[52px] z-10 hidden sm:block">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-l-none rounded-r-lg bg-card border border-l-0 border-border shadow-sm opacity-40 hover:opacity-100 transition-opacity"
            onClick={() => setSidebarExpanded((prev) => (prev === null ? false : !prev))}
          >
            {sidebarExpanded === false ? (
              <PanelLeftOpen className="size-3.5" />
            ) : (
              <PanelLeftClose className="size-3.5" />
            )}
          </Button>
        </div>

        {/* Screen content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            contentClassName,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
