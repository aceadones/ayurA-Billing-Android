import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon: LucideIcon;
  variant?: "default" | "warning" | "danger" | "success";
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = "default",
  className,
}: KpiCardProps) {
  const trendIcon =
    !trend ? null
    : trend.value > 0 ? TrendingUp
    : trend.value < 0 ? TrendingDown
    : Minus;

  const variantStyles = {
    default: {
      iconBg: "bg-ayura-green-light",
      iconColor: "text-ayura-green",
    },
    warning: {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    danger: {
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
    success: {
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  };

  const v = variantStyles[variant];

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-border p-5 flex flex-col gap-3",
        "shadow-sm hover:shadow-md transition-shadow duration-200",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground leading-tight">
          {title}
        </p>
        <div className={cn("p-2.5 rounded-xl", v.iconBg)}>
          <Icon className={cn("size-4.5", v.iconColor)} strokeWidth={2} />
        </div>
      </div>

      <div>
        <p className="text-2xl font-display font-semibold text-foreground leading-none">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      {trend && trendIcon && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend.value > 0
              ? "text-emerald-600"
              : trend.value < 0
                ? "text-rose-600"
                : "text-muted-foreground",
          )}
        >
          {(() => {
            const TrendIcon = trendIcon;
            return <TrendIcon className="size-3.5" />;
          })()}
          <span>
            {trend.value > 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}
