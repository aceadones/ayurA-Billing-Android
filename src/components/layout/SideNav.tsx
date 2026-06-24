import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ClinicLogo } from "@/components/ayura/ClinicLogo";
import { useClinicStore } from "@/stores/clinic-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  ReceiptText,
  FileText,
  Package,
  CalendarDays,
  Stethoscope,
  BarChart2,
  ListOrdered,
  Settings,
  LogOut,
  MessageCircle,
} from "lucide-react";

export interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  roleRequired?: "doctor" | "admin";
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/invoice", icon: ReceiptText, label: "Invoice" },
  { to: "/estimation", icon: FileText, label: "Estimation" },
  { to: "/stock", icon: Package, label: "Stock" },
  { to: "/booking", icon: CalendarDays, label: "Booking" },
  { to: "/doctor-portal", icon: Stethoscope, label: "Doctor", roleRequired: "doctor" },
  { to: "/insights", icon: BarChart2, label: "Insights" },
  { to: "/all-invoices", icon: ListOrdered, label: "Invoices" },
  { to: "/messaging", icon: MessageCircle, label: "Messaging" },
  { to: "/admin", icon: Settings, label: "Admin", roleRequired: "admin" },
];

interface SideNavProps {
  collapsed?: boolean;
  currentRole?: string | null;
  onLock?: () => void;
}

export function SideNav({
  collapsed = false,
  currentRole,
  onLock,
}: SideNavProps) {
  const location = useLocation();
  const settings = useClinicStore((s) => s.settings);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.roleRequired === "doctor") {
      return currentRole === "doctor" || currentRole === "admin";
    }
    if (item.roleRequired === "admin") return currentRole === "admin";
    return true;
  });

  return (
    <aside
      className={cn(
        "sidebar-dark flex flex-col h-full transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-16" : "w-[220px]",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center border-b border-white/10 shrink-0",
          collapsed ? "justify-center px-3 py-4" : "px-4 py-4",
        )}
      >
        {collapsed ? (
          <ClinicLogo
            clinicName={settings?.clinicName}
            logoUri={settings?.logoUri}
            size="sm"
            variant="icon-only"
          />
        ) : (
          <ClinicLogo
            clinicName={settings?.clinicName}
            logoUri={settings?.logoUri}
            size="sm"
            variant="white"
          />
        )}
      </div>

      {/* Nav items */}
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-0.5 px-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              location.pathname.startsWith(item.to + "/");

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive: navActive }) =>
                  cn(
                    "flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150",
                    "text-sm font-medium group min-h-[44px]",
                    navActive || isActive
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white/90",
                    collapsed && "justify-center px-2",
                  )
                }
              >
                <Icon
                  className={cn(
                    "shrink-0 transition-colors",
                    collapsed ? "size-5" : "size-4.5",
                  )}
                />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom actions */}
      <div className="shrink-0 border-t border-white/10 p-2">
        <Separator className="bg-white/10 mb-2" />
        <button
          type="button"
          onClick={onLock}
          className={cn(
            "flex items-center gap-3 w-full px-2.5 py-2.5 rounded-xl",
            "text-white/50 hover:bg-white/10 hover:text-white/80 transition-all duration-150",
            "text-sm font-medium min-h-[44px]",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className={cn("shrink-0", collapsed ? "size-5" : "size-4.5")} />
          {!collapsed && <span>Lock</span>}
        </button>
      </div>
    </aside>
  );
}
