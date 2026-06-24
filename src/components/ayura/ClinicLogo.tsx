import { cn } from "@/lib/utils";

interface ClinicLogoProps {
  clinicName?: string;
  logoUri?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "white" | "icon-only";
  layout?: "horizontal" | "stacked";
  className?: string;
}

const sizes = {
  sm: { box: 32, image: 32, name: "text-sm" },
  md: { box: 40, image: 40, name: "text-base" },
  lg: { box: 56, image: 56, name: "text-xl" },
  xl: { box: 80, image: 80, name: "text-2xl" },
};

function clinicInitials(name?: string): string {
  if (!name?.trim()) return "C";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function ClinicLogo({
  clinicName = "Clinic",
  logoUri,
  size = "md",
  variant = "default",
  layout = "horizontal",
  className,
}: ClinicLogoProps) {
  const s = sizes[size];
  const isWhite = variant === "white";
  const showText = variant !== "icon-only";
  const stacked = layout === "stacked";

  const mark = logoUri ? (
    <img
      src={logoUri}
      alt={clinicName}
      className="rounded-xl object-contain bg-white"
      style={{ width: s.image, height: s.image }}
    />
  ) : (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl shrink-0 font-display font-semibold",
        isWhite
          ? "bg-white/15 border border-white/25 text-white"
          : "bg-ayura-green-light border border-border text-ayura-green",
      )}
      style={{ width: s.box, height: s.box, fontSize: s.box * 0.32 }}
    >
      {clinicInitials(clinicName)}
    </div>
  );

  if (!showText) {
    return <div className={cn("flex items-center", className)}>{mark}</div>;
  }

  return (
    <div
      className={cn(
        "min-w-0",
        stacked
          ? "flex flex-col items-center gap-3 text-center"
          : "flex items-center gap-2.5",
        className,
      )}
    >
      {mark}
      <span
        className={cn(
          "font-display font-semibold leading-tight",
          stacked ? "max-w-xs" : "truncate",
          s.name,
          isWhite ? "text-white" : "text-foreground",
        )}
      >
        {clinicName}
      </span>
    </div>
  );
}
