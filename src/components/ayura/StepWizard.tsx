import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
}

interface StepWizardProps {
  steps: WizardStep[];
  currentStep: number;
  className?: string;
}

export function StepWizard({ steps, currentStep, className }: StepWizardProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="relative h-1.5 bg-border rounded-full overflow-hidden mb-4">
        <div
          className="absolute inset-y-0 left-0 gradient-ayura rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.round(((currentStep) / (steps.length - 1)) * 100)}%`,
          }}
        />
      </div>

      {/* Step labels — compact scrollable row on small screens */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1 scrollbar-none">
        {steps.map((step, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={step.id} className="flex items-center shrink-0">
              {/* Connector */}
              {index > 0 && (
                <div
                  className={cn(
                    "h-px w-6 transition-colors duration-300",
                    index <= currentStep ? "bg-primary" : "bg-border",
                  )}
                />
              )}

              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center size-7 rounded-full text-xs font-bold border-2 transition-all duration-300",
                    isDone &&
                      "bg-primary border-primary text-primary-foreground",
                    isActive &&
                      "bg-primary/10 border-primary text-primary scale-110",
                    !isDone &&
                      !isActive &&
                      "bg-background border-border text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="size-3.5" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "mt-1 text-[9px] font-medium whitespace-nowrap max-w-[52px] text-center leading-tight",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
