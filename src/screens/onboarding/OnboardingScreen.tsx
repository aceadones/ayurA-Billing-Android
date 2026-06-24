import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AyuraLogo } from "@/components/ayura/AyuraLogo";
import { StepWizard } from "@/components/ayura/StepWizard";
import type { WizardStep } from "@/components/ayura/StepWizard";
import { PinPad } from "@/components/ayura/PinPad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OnboardingDraft } from "@/types/billing";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { completeOnboarding } from "@/services/onboarding-service";
import { useClinicStore } from "@/stores/clinic-store";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  Phone,
  MapPin,
  KeyRound,
  ShieldCheck,
  UserRound,
  Pill,
  Clock,
  AlertTriangle,
  PackageSearch,
  Leaf,
  Sparkles,
} from "lucide-react";

const STEPS: WizardStep[] = [
  { id: "welcome", label: "Welcome" },
  { id: "intro", label: "Intro" },
  { id: "clinic", label: "Clinic" },
  { id: "device", label: "Device" },
  { id: "admin", label: "Admin" },
  { id: "frontdesk", label: "Front Desk" },
  { id: "doctor", label: "Doctor" },
  { id: "pharmacist", label: "Pharmacist" },
  { id: "settings", label: "Settings" },
  { id: "complete", label: "Done" },
];

interface OnboardingDraftLocal extends OnboardingDraft {}

function isStepValid(step: number, draft: OnboardingDraftLocal): boolean {
  switch (step) {
    case 0: return true; // Welcome — always valid
    case 1: return true; // Intro — always valid
    case 2: return draft.clinicName.length > 2 && draft.phone.length >= 10;
    case 3: return draft.deviceKey.length >= 6;
    case 4: return draft.adminPassword.length >= 8;
    case 5: return draft.frontDeskPin.length >= 4;
    case 6: return draft.doctorName.length > 1 && draft.doctorPin.length >= 4;
    case 7: return draft.pharmacistName.length > 1;
    case 8: return draft.slotDuration.length > 0 && draft.stockThreshold.length > 0;
    case 9: return true; // Complete
    default: return false;
  }
}

export function OnboardingScreen() {
  const navigate = useNavigate();
  const step = useOnboardingStore((s) => s.step);
  const draft = useOnboardingStore((s) => s.draft);
  const setStep = useOnboardingStore((s) => s.setStep);
  const updateDraft = useOnboardingStore((s) => s.updateDraft);
  const loadClinic = useClinicStore((s) => s.load);
  const [saving, setSaving] = useState(false);

  function update(key: keyof OnboardingDraftLocal, value: string) {
    updateDraft({ [key]: value });
  }

  async function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    setSaving(true);
    try {
      await completeOnboarding(draft);
      await loadClinic();
      toast.success("Clinic setup complete");
      navigate("/access");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Setup failed");
    } finally {
      setSaving(false);
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  const valid = isStepValid(step, draft);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header (steps 1–8 only) ── */}
      {step > 0 && step < STEPS.length - 1 && (
        <div className="px-6 pt-6 pb-3">
          <StepWizard steps={STEPS} currentStep={step} />
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-6">
        <div className="w-full max-w-md animate-scale-in">
          {/* STEP 0 — Welcome */}
          {step === 0 && (
            <div className="flex flex-col items-center text-center gap-8">
              <div className="w-20 h-20 gradient-ayura rounded-3xl flex items-center justify-center shadow-lg shadow-ayura-green/20">
                <Leaf className="size-9 text-white" />
              </div>
              <div>
                <AyuraLogo size="xl" className="justify-center mb-3" />
                <p className="text-muted-foreground text-base leading-relaxed mt-2 max-w-xs mx-auto">
                  Complete clinic management for ayurA Wellness Centre
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full text-center">
                {[
                  ["Billing", "Invoices & estimates"],
                  ["Stock", "Medicine inventory"],
                  ["Booking", "Appointments"],
                ].map(([title, sub]) => (
                  <div key={title} className="bg-muted rounded-2xl p-3">
                    <p className="font-semibold text-sm text-foreground">{title}</p>
                    <p className="text-2xs text-muted-foreground mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                className="w-full gradient-ayura text-white border-0 shadow-md shadow-ayura-green/25 text-base h-12"
                onClick={next}
              >
                Begin Setup <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          )}

          {/* STEP 1 — Intro */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div className="inline-flex p-4 bg-ayura-green-light rounded-2xl mb-4">
                  <Sparkles className="size-7 text-ayura-green" />
                </div>
                <h2 className="font-display text-3xl font-semibold text-foreground">
                  What to expect
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  9 quick steps to set up your clinic. Takes under 3 minutes.
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { icon: Building2, text: "Clinic name, address & contact" },
                  { icon: KeyRound, text: "Device security key" },
                  { icon: ShieldCheck, text: "Admin & staff credentials" },
                  { icon: UserRound, text: "First doctor & pharmacist" },
                  { icon: Clock, text: "Default appointment slot" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3">
                    <div className="p-2 bg-ayura-green-light rounded-lg shrink-0">
                      <Icon className="size-4 text-ayura-green" />
                    </div>
                    <span className="text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — Clinic Setup */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <div className="inline-flex p-3 bg-ayura-green-light rounded-xl mb-3">
                  <Building2 className="size-6 text-ayura-green" />
                </div>
                <h2 className="font-display text-2xl font-semibold">Clinic Details</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  This appears on all invoices and reports.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="clinicName">Clinic Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="clinicName"
                      placeholder="ayurA Wellness Centre"
                      value={draft.clinicName}
                      onChange={(e) => update("clinicName", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <textarea
                      id="address"
                      placeholder="18th Main Road, Anna Nagar, Chennai"
                      value={draft.address}
                      onChange={(e) => update("address", e.target.value)}
                      rows={2}
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={draft.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Device Auth */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <div className="inline-flex p-3 bg-ayura-green-light rounded-xl mb-3">
                  <KeyRound className="size-6 text-ayura-green" />
                </div>
                <h2 className="font-display text-2xl font-semibold">Device Security</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  A unique key for this device. Minimum 6 characters.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deviceKey">Security Key *</Label>
                <Input
                  id="deviceKey"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={draft.deviceKey}
                  onChange={(e) => update("deviceKey", e.target.value)}
                />
                {draft.deviceKey.length > 0 && draft.deviceKey.length < 6 && (
                  <p className="text-xs text-destructive">At least 6 characters required</p>
                )}
              </div>
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="flex gap-3 p-4">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Keep this key safe. It authorises this device to access clinic data and cannot be easily reset.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 4 — Admin Setup */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div>
                <div className="inline-flex p-3 bg-ayura-green-light rounded-xl mb-3">
                  <ShieldCheck className="size-6 text-ayura-green" />
                </div>
                <h2 className="font-display text-2xl font-semibold">Admin Password</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  For managing clinic settings. Minimum 8 characters.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="adminPass">Admin Password *</Label>
                <Input
                  id="adminPass"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={draft.adminPassword}
                  onChange={(e) => update("adminPassword", e.target.value)}
                />
                {draft.adminPassword.length > 0 && draft.adminPassword.length < 8 && (
                  <p className="text-xs text-destructive">At least 8 characters required</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 5 — Front Desk PIN */}
          {step === 5 && (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <div className="inline-flex p-3 bg-ayura-green-light rounded-xl mb-3">
                  <KeyRound className="size-6 text-ayura-green" />
                </div>
                <h2 className="font-display text-2xl font-semibold">Front Desk PIN</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Staff uses this PIN to access billing. Min. 4 digits.
                </p>
              </div>
              <PinPad
                value={draft.frontDeskPin}
                maxLength={6}
                onChange={(v) => update("frontDeskPin", v)}
                label="Enter PIN"
              />
            </div>
          )}

          {/* STEP 6 — Doctor Setup */}
          {step === 6 && (
            <div className="flex flex-col gap-6">
              <div>
                <div className="inline-flex p-3 bg-ayura-green-light rounded-xl mb-3">
                  <UserRound className="size-6 text-ayura-green" />
                </div>
                <h2 className="font-display text-2xl font-semibold">First Doctor</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  More doctors can be added from Admin after setup.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="doctorName">Doctor Name *</Label>
                  <Input
                    id="doctorName"
                    placeholder="Dr. Veda Gayathri S"
                    value={draft.doctorName}
                    onChange={(e) => update("doctorName", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 pt-2">
                <p className="text-sm text-muted-foreground">Doctor PIN (min. 4 digits)</p>
                <PinPad
                  value={draft.doctorPin}
                  maxLength={6}
                  onChange={(v) => update("doctorPin", v)}
                />
              </div>
            </div>
          )}

          {/* STEP 7 — Pharmacist */}
          {step === 7 && (
            <div className="flex flex-col gap-6">
              <div>
                <div className="inline-flex p-3 bg-ayura-green-light rounded-xl mb-3">
                  <Pill className="size-6 text-ayura-green" />
                </div>
                <h2 className="font-display text-2xl font-semibold">Pharmacist</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  The pharmacist on duty is selected from Dashboard.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pharmaName">Pharmacist Name *</Label>
                <Input
                  id="pharmaName"
                  placeholder="e.g. Meera R"
                  value={draft.pharmacistName}
                  onChange={(e) => update("pharmacistName", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 8 — Default Settings */}
          {step === 8 && (
            <div className="flex flex-col gap-6">
              <div>
                <div className="inline-flex p-3 bg-ayura-green-light rounded-xl mb-3">
                  <Clock className="size-6 text-ayura-green" />
                </div>
                <h2 className="font-display text-2xl font-semibold">Default Settings</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Operational defaults. Can be changed in Admin.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="slotDur">Slot Duration (minutes) *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="slotDur"
                      type="number"
                      min="10"
                      max="120"
                      step="5"
                      placeholder="30"
                      value={draft.slotDuration}
                      onChange={(e) => update("slotDuration", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="stockThresh">Low Stock Threshold (units)</Label>
                  <div className="relative">
                    <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="stockThresh"
                      type="number"
                      min="1"
                      placeholder="10"
                      value={draft.stockThreshold}
                      onChange={(e) => update("stockThreshold", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="expiryWin">Expiry Alert Window (days)</Label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="expiryWin"
                      type="number"
                      min="7"
                      placeholder="30"
                      value={draft.expiryWindow}
                      onChange={(e) => update("expiryWindow", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9 — Complete */}
          {step === 9 && (
            <div className="flex flex-col items-center text-center gap-8">
              <div className="relative">
                <div className="size-24 gradient-ayura rounded-full flex items-center justify-center shadow-lg shadow-ayura-green/30">
                  <Check className="size-11 text-white" strokeWidth={3} />
                </div>
                <div className="absolute -top-1 -right-1 size-7 bg-ayura-gold rounded-full flex items-center justify-center shadow-md">
                  <Sparkles className="size-3.5 text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-display text-3xl font-semibold text-foreground">
                  All set!
                </h2>
                <p className="text-muted-foreground mt-2 leading-relaxed text-sm max-w-xs mx-auto">
                  <strong className="text-foreground">{draft.clinicName || "Your clinic"}</strong> is configured and
                  ready. Enter the app to start billing.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 w-full text-sm">
                {[
                  ["Clinic", draft.clinicName || "—"],
                  ["Doctor", draft.doctorName || "—"],
                  ["Pharmacist", draft.pharmacistName || "—"],
                  ["Slot", `${draft.slotDuration} min`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-muted rounded-xl p-3 text-left">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium text-foreground truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation bar ── */}
      {step > 0 && (
        <div
          className={cn(
            "px-6 pb-6 pt-3 flex gap-3",
            step === STEPS.length - 1 ? "justify-center" : "justify-between",
          )}
        >
          {step < STEPS.length - 1 && (
            <Button
              variant="outline"
              size="lg"
              onClick={back}
              className="h-12 px-6"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
          )}
          <Button
            size="lg"
            disabled={!valid || saving}
            onClick={() => void next()}
            className={cn(
              "h-12 px-8 gradient-ayura text-white border-0 shadow-md shadow-ayura-green/20",
              step === STEPS.length - 1 && "px-12",
            )}
          >
            {step === STEPS.length - 1 ? (
              <>Enter App <ArrowRight className="ml-2 size-4" /></>
            ) : (
              <>Continue <ArrowRight className="ml-2 size-4" /></>
            )}
          </Button>
        </div>
      )}
      {step === 0 && <div className="pb-6" />}
    </div>
  );
}
