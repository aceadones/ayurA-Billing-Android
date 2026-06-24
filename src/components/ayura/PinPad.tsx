import { cn } from "@/lib/utils";
import { Delete } from "lucide-react";

interface PinPadProps {
  value: string;
  maxLength?: number;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

export function PinPad({
  value,
  maxLength = 6,
  onChange,
  label,
  error,
  className,
}: PinPadProps) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  function handleKey(key: string) {
    if (key === "⌫") {
      onChange(value.slice(0, -1));
    } else if (key && value.length < maxLength) {
      onChange(value + key);
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      {label && (
        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          {label}
        </p>
      )}

      {/* PIN dots */}
      <div className="flex gap-3">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "size-3.5 rounded-full border-2 transition-all duration-200",
              i < value.length
                ? "bg-primary border-primary scale-110"
                : "bg-transparent border-primary/40",
            )}
          />
        ))}
      </div>

      {/* Numpad grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {keys.map((key, i) => {
          if (key === "") {
            return <div key={i} />;
          }

          const isBackspace = key === "⌫";

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleKey(key)}
              disabled={!isBackspace && value.length >= maxLength}
              className={cn(
                "flex items-center justify-center rounded-2xl font-sans font-semibold",
                "size-[72px] text-xl transition-all duration-150 active:scale-95",
                "border border-border shadow-sm",
                isBackspace
                  ? "bg-muted text-muted-foreground hover:bg-muted/80"
                  : "bg-card text-foreground hover:bg-secondary active:bg-secondary",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              )}
            >
              {isBackspace ? (
                <Delete className="size-5" />
              ) : (
                <span>{key}</span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-destructive font-medium animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
