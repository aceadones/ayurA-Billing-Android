import { cn } from "@/lib/utils";

interface AyuraLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "white" | "stacked";
  className?: string;
}

const sizes = {
  sm: { icon: 28, ayur: "text-xl", a: "text-xl", tagline: "text-[9px]" },
  md: { icon: 36, ayur: "text-2xl", a: "text-2xl", tagline: "text-[10px]" },
  lg: { icon: 48, ayur: "text-3xl", a: "text-3xl", tagline: "text-xs" },
  xl: { icon: 72, ayur: "text-5xl", a: "text-5xl", tagline: "text-sm" },
};

export function AyuraLogo({
  size = "md",
  variant = "default",
  className,
}: AyuraLogoProps) {
  const s = sizes[size];
  const isWhite = variant === "white";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Icon mark */}
      <div
        className={cn(
          "flex items-center justify-center rounded-xl shrink-0",
          isWhite
            ? "bg-white/20 border border-white/30"
            : "bg-ayura-green border border-ayura-green-dark/30 shadow-sm",
        )}
        style={{ width: s.icon, height: s.icon }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: s.icon * 0.65, height: s.icon * 0.65 }}
        >
          {/* Stylised leaf / herb mark */}
          <path
            d="M16 4C16 4 8 8 8 16C8 21.5 11.5 26 16 28C20.5 26 24 21.5 24 16C24 8 16 4 16 4Z"
            fill={isWhite ? "white" : "#C9973A"}
            opacity="0.9"
          />
          <path
            d="M16 10C16 10 12 13 12 17C12 20 13.8 22.5 16 24C18.2 22.5 20 20 20 17C20 13 16 10 16 10Z"
            fill={isWhite ? "white" : "#FAFAF7"}
            opacity="0.7"
          />
          <line
            x1="16"
            y1="10"
            x2="16"
            y2="24"
            stroke={isWhite ? "white" : "#FAFAF7"}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {variant !== "stacked" ? (
        <div className="flex flex-col">
          <div className="flex items-baseline leading-none">
            <span
              className={cn(
                "font-display font-semibold tracking-tight",
                s.ayur,
                isWhite ? "text-white" : "text-ayura-green",
              )}
            >
              ayur
            </span>
            <span
              className={cn(
                "font-display font-bold tracking-tight",
                s.a,
                isWhite ? "text-white/90" : "text-ayura-gold",
              )}
            >
              A
            </span>
          </div>
          <span
            className={cn(
              "font-sans tracking-widest uppercase font-medium leading-none mt-0.5",
              s.tagline,
              isWhite ? "text-white/60" : "text-ayura-earth/80",
            )}
          >
            Billing
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex items-baseline leading-none">
            <span
              className={cn(
                "font-display font-semibold tracking-tight",
                s.ayur,
                isWhite ? "text-white" : "text-ayura-green",
              )}
            >
              ayur
            </span>
            <span
              className={cn(
                "font-display font-bold tracking-tight",
                s.a,
                isWhite ? "text-white/90" : "text-ayura-gold",
              )}
            >
              A
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
