import { cn } from "@/lib/utils";
import { resolveClinicLogo } from "@/lib/brand";

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
  const imageSrc = resolveClinicLogo(logoUri);

  const mark = (
    <img
      src={imageSrc}
      alt={clinicName}
      className="rounded-full object-contain shrink-0"
      style={{ width: s.image, height: s.image }}
    />
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
