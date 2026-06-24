import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ClinicLogo } from "@/components/ayura/ClinicLogo";
import { useClinicStore } from "@/stores/clinic-store";
import { RoleCard } from "@/components/ayura/RoleBadge";
import type { AppRole } from "@/components/ayura/RoleBadge";
import { PinPad } from "@/components/ayura/PinPad";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { verifyRoleCredential } from "@/services/auth-service";
import { useSessionStore } from "@/stores/session-store";

type AuthStep = "role-select" | "pin-entry";

export function AccessScreen() {
  const navigate = useNavigate();
  const unlock = useSessionStore((s) => s.unlock);
  const clinicName = useClinicStore((s) => s.settings?.clinicName);
  const logoUri = useClinicStore((s) => s.settings?.logoUri);
  const [step, setStep] = useState<AuthStep>("role-select");
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  function selectRole(role: AppRole) {
    setSelectedRole(role);
    setPin("");
    setError("");
    setStep("pin-entry");
  }

  function handlePinChange(value: string) {
    setPin(value);
    setError("");

    const maxLen = selectedRole === "admin" ? 12 : 6;
    // Only auto-check when all digit slots are filled (avoids checking a partial PIN)
    if (value.length === maxLen) {
      void verifyPin(value);
    }
  }

  async function verifyPin(value: string) {
    if (!selectedRole || checking) return;

    const minLen = selectedRole === "admin" ? 8 : 4;
    if (value.length < minLen) return;

    setChecking(true);
    try {
      const ok = await verifyRoleCredential(selectedRole, value);
      if (ok) {
        unlock(selectedRole);
        toast.success("Session unlocked");
        navigate("/dashboard");
      } else {
        setError("Incorrect PIN. Try again.");
        setTimeout(() => setPin(""), 600);
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <ClinicLogo clinicName={clinicName} logoUri={logoUri} size="md" />
        <div className="flex flex-col items-end">
          {clinicName && (
            <p className="text-xs font-medium text-foreground">{clinicName}</p>
          )}
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
        <div className={cn("w-full max-w-lg animate-scale-in")}>
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

          {step === "pin-entry" && selectedRole && (
            <div className="flex flex-col items-center gap-6">
              <button
                type="button"
                onClick={() => {
                  setStep("role-select");
                  setPin("");
                  setError("");
                }}
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
                  Enter your credentials to unlock
                </p>
              </div>

              <PinPad
                value={pin}
                maxLength={selectedRole === "admin" ? 12 : 6}
                onChange={handlePinChange}
                error={error}
              />

              <Button
                className="gradient-ayura text-white border-0 min-w-[160px]"
                disabled={
                  checking ||
                  pin.length < (selectedRole === "admin" ? 8 : 4)
                }
                onClick={() => void verifyPin(pin)}
              >
                {checking ? "Checking…" : "Unlock"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-xs"
                onClick={() => {
                  setPin("");
                  setError("");
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="py-4 text-center">
        {clinicName && (
          <p className="text-xs text-muted-foreground">{clinicName}</p>
        )}
      </div>
    </div>
  );
}
