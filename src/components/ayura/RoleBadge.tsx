import { cn } from "@/lib/utils";
import { Stethoscope, MonitorSmartphone, ShieldCheck } from "lucide-react";

export type AppRole = "front-desk" | "doctor" | "admin";

const roleConfig: Record<
  AppRole,
  { label: string; icon: typeof Stethoscope; color: string }
> = {
  "front-desk": {
    label: "Front Desk",
    icon: MonitorSmartphone,
    color: "bg-sky-100 text-sky-700 border-sky-200",
  },
  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    color: "bg-ayura-green-light text-ayura-green border-green-200",
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    color: "bg-ayura-gold-light text-ayura-bark border-amber-200",
  },
};

interface RoleBadgeProps {
  role: AppRole;
  size?: "sm" | "md";
  className?: string;
}

export function RoleBadge({ role, size = "md", className }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        config.color,
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      {config.label}
    </span>
  );
}

export function RoleCard({
  role,
  isSelected,
  onClick,
}: {
  role: AppRole;
  isSelected?: boolean;
  onClick: () => void;
}) {
  const config = roleConfig[role];
  const Icon = config.icon;

  const cardColors: Record<AppRole, string> = {
    "front-desk":
      "border-sky-200 hover:border-sky-400 data-[selected=true]:border-sky-500 data-[selected=true]:bg-sky-50",
    doctor:
      "border-green-200 hover:border-ayura-green data-[selected=true]:border-ayura-green data-[selected=true]:bg-ayura-green-light",
    admin:
      "border-amber-200 hover:border-ayura-gold data-[selected=true]:border-ayura-gold data-[selected=true]:bg-ayura-gold-light",
  };

  const iconColors: Record<AppRole, string> = {
    "front-desk": "text-sky-600",
    doctor: "text-ayura-green",
    admin: "text-ayura-gold",
  };

  return (
    <button
      type="button"
      data-selected={isSelected}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 bg-card",
        "transition-all duration-200 active:scale-[0.98] cursor-pointer touch-target",
        "min-w-[140px] shadow-sm hover:shadow-md",
        cardColors[role],
      )}
    >
      <div
        className={cn(
          "p-4 rounded-2xl transition-colors",
          isSelected ? config.color : "bg-muted",
        )}
      >
        <Icon
          className={cn(
            "size-8 transition-colors",
            isSelected ? iconColors[role] : "text-muted-foreground",
          )}
        />
      </div>
      <span
        className={cn(
          "font-semibold text-base transition-colors",
          isSelected ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {config.label}
      </span>
    </button>
  );
}
