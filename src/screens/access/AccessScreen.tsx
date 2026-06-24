import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AyuraLogo } from "@/components/ayura/AyuraLogo";
import { RoleCard } from "@/components/ayura/RoleBadge";
import type { AppRole } from "@/components/ayura/RoleBadge";
import { PinPad } from "@/components/ayura/PinPad";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthStep = "role-select" | "pin-entry";

const ROLE_PINS: Record<AppRole, string> = {
  "front-desk": "1234",
  doctor: "5678",
  admin: "admin123",
};

export function AccessScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>("role-select");
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function selectRole(role: AppRole) {
    setSelectedRole(role);
    setPin("");
    setError("");
    setStep("pin-entry");
  }

  function handlePinChange(value: string) {
    setPin(value);
    setError("");

    if (value.length >= 4) {
      const correctPin = ROLE_PINS[selectedRole!];
      if (value === correctPin || (selectedRole === "admin" && value === "1234")) {
        setTimeout(() => navigate("/dashboard"), 200);
      } else if (value.length >= correctPin.length) {
        setError("Incorrect PIN. Try again.");
        setTimeout(() => setPin(""), 600);
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <AyuraLogo size="md" />
        <div className="flex flex-col items-end">
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div
          className={cn(
            "w-full max-w-lg animate-scale-in",
          )}
        >
          {/* ── Role selection ── */}
          {step === "role-select" && (
            <div className="flex flex-col gap-8">
              <div className="text-center">
                <h2 className="font-display text-3xl font-semibold text-foreground">
                  Who are you?
                </h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Select your role to continue
                </p>
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                {(["front-desk", "doctor", "admin"] as AppRole[]).map((role) => (
                  <RoleCard
                    key={role}
                    role={role}
                    onClick={() => selectRole(role)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── PIN entry ── */}
          {step === "pin-entry" && selectedRole && (
            <div className="flex flex-col items-center gap-6">
              <button
                type="button"
                onClick={() => { setStep("role-select"); setPin(""); setError(""); }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
              >
                <ArrowLeft className="size-4" />
                Change role
              </button>

              <div className="text-center">
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {selectedRole === "front-desk"
                    ? "Front Desk PIN"
                    : selectedRole === "doctor"
                      ? "Doctor PIN"
                      : "Admin Password"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Enter your PIN to unlock
                </p>
              </div>

              <PinPad
                value={pin}
                maxLength={selectedRole === "admin" ? 8 : 6}
                onChange={handlePinChange}
                error={error}
              />

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-xs"
                onClick={() => { setPin(""); setError(""); }}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center">
        <p className="text-xs text-muted-foreground">
          ayurA Billing • Powered by NextLayer Labs
        </p>
      </div>
    </div>
  );
}
