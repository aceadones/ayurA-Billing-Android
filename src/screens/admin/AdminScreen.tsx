import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/db/database";
import { useAppShell } from "@/hooks/use-app-shell";
import { useClinicStore } from "@/stores/clinic-store";
import {
  updateAdminPassword,
  updateFrontDeskPin,
} from "@/services/auth-service";
import {
  addDoctor,
  addTreatment,
} from "@/services/booking-service";
import {
  exportInvoicesCsv,
  exportInvoicesXlsx,
} from "@/services/export-service";
import {
  KeyRound,
  Stethoscope,
  Download,
  Plus,
  FileSpreadsheet,
  FileText,
  ChevronRight,
  Leaf,
  Shield,
  QrCode,
  Phone,
} from "lucide-react";

export function AdminScreen() {
  const shell = useAppShell("Admin", "Clinic administration");
  const doctors = useLiveQuery(() => db.doctors.filter((d) => d.active).toArray(), []);
  const treatments = useLiveQuery(() => db.treatments.filter((t) => t.active).toArray(), []);
  const { settings, load: reloadSettings } = useClinicStore();

  const [frontDesk, setFrontDesk] = useState({ current: "", next: "" });
  const [adminPass, setAdminPass] = useState({ current: "", next: "" });
  const [newDoctor, setNewDoctor] = useState({ name: "", pin: "", specialization: "", phone: "" });
  const [newTreatment, setNewTreatment] = useState({ name: "", fee: "", capacity: "2" });
  const [exportRange, setExportRange] = useState({ from: "", to: "" });
  const [paymentQrUri, setPaymentQrUri] = useState(settings?.paymentQrUri ?? "");

  return (
    <AppShell {...shell}>
      <div className="screen-pad flex flex-col gap-4">
        <Tabs defaultValue="security">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="security" className="gap-1 text-xs">
              <Shield className="size-3.5" />
              Security
            </TabsTrigger>
            <TabsTrigger value="doctors" className="gap-1 text-xs">
              <Stethoscope className="size-3.5" />
              Doctors
            </TabsTrigger>
            <TabsTrigger value="treatments" className="gap-1 text-xs">
              <Leaf className="size-3.5" />
              Treatments
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-1 text-xs">
              <Download className="size-3.5" />
              Export
            </TabsTrigger>
            <TabsTrigger value="clinic" className="gap-1 text-xs">
              <QrCode className="size-3.5" />
              Clinic
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="mt-4">
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <KeyRound className="size-4 text-ayura-green" />
                    Front Desk PIN
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-0">
                  <Input
                    type="password"
                    placeholder="Current PIN"
                    value={frontDesk.current}
                    onChange={(e) => setFrontDesk({ ...frontDesk, current: e.target.value })}
                  />
                  <Input
                    type="password"
                    placeholder="New PIN (min 4 digits)"
                    value={frontDesk.next}
                    onChange={(e) => setFrontDesk({ ...frontDesk, next: e.target.value })}
                  />
                  <Button
                    size="sm"
                    className="gradient-ayura text-white border-0 h-9 self-start"
                    onClick={async () => {
                      try {
                        await updateFrontDeskPin(frontDesk.current, frontDesk.next);
                        toast.success("Front desk PIN updated");
                        setFrontDesk({ current: "", next: "" });
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Update failed");
                      }
                    }}
                  >
                    Update PIN
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="size-4 text-ayura-green" />
                    Admin Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-0">
                  <Input
                    type="password"
                    placeholder="Current password"
                    value={adminPass.current}
                    onChange={(e) => setAdminPass({ ...adminPass, current: e.target.value })}
                  />
                  <Input
                    type="password"
                    placeholder="New password (min 8 chars)"
                    value={adminPass.next}
                    onChange={(e) => setAdminPass({ ...adminPass, next: e.target.value })}
                  />
                  <Button
                    size="sm"
                    className="gradient-ayura text-white border-0 h-9 self-start"
                    onClick={async () => {
                      try {
                        await updateAdminPassword(adminPass.current, adminPass.next);
                        toast.success("Admin password updated");
                        setAdminPass({ current: "", next: "" });
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Update failed");
                      }
                    }}
                  >
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="doctors" className="mt-4">
            <div className="flex flex-col gap-3">
              <Card>
                <CardContent className="pt-4 flex flex-col gap-3">
                  <Input
                    placeholder="Doctor name"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  />
                  <Input
                    placeholder="PIN"
                    type="password"
                    value={newDoctor.pin}
                    onChange={(e) => setNewDoctor({ ...newDoctor, pin: e.target.value })}
                  />
                  <Input
                    placeholder="Specialization"
                    value={newDoctor.specialization}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, specialization: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Phone (for Call Doctor FAB)"
                    type="tel"
                    value={newDoctor.phone}
                    onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                  />
                  <Button
                    size="sm"
                    className="gradient-ayura text-white border-0 h-8 gap-1.5 self-start"
                    onClick={async () => {
                      try {
                        await addDoctor(newDoctor.name, newDoctor.pin, newDoctor.specialization, newDoctor.phone);
                        toast.success("Doctor added");
                        setNewDoctor({ name: "", pin: "", specialization: "", phone: "" });
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Failed");
                      }
                    }}
                  >
                    <Plus className="size-3.5" />
                    Add Doctor
                  </Button>
                </CardContent>
              </Card>

              {(doctors ?? []).map((d) => (
                <Card key={d.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="p-2.5 bg-ayura-green-light rounded-xl shrink-0">
                      <Stethoscope className="size-4 text-ayura-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.specialization}</p>
                      {(d as { phone?: string }).phone && (
                        <p className="text-xs text-ayura-primary font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="size-3" />
                          {(d as { phone?: string }).phone}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="treatments" className="mt-4">
            <div className="flex flex-col gap-3">
              <Card>
                <CardContent className="pt-4 flex flex-col gap-3">
                  <Input
                    placeholder="Treatment name"
                    value={newTreatment.name}
                    onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Fee"
                      value={newTreatment.fee}
                      onChange={(e) => setNewTreatment({ ...newTreatment, fee: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Slot capacity"
                      value={newTreatment.capacity}
                      onChange={(e) =>
                        setNewTreatment({ ...newTreatment, capacity: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    size="sm"
                    className="gradient-ayura text-white border-0 h-8 gap-1.5 self-start"
                    onClick={async () => {
                      try {
                        await addTreatment(
                          newTreatment.name,
                          Number(newTreatment.fee) || 0,
                          Number(newTreatment.capacity) || 2,
                        );
                        toast.success("Treatment added");
                        setNewTreatment({ name: "", fee: "", capacity: "2" });
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Failed");
                      }
                    }}
                  >
                    <Plus className="size-3.5" />
                    Add Treatment
                  </Button>
                </CardContent>
              </Card>

              {(treatments ?? []).map((t) => (
                <Card key={t.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="p-2.5 bg-ayura-green-light rounded-xl shrink-0">
                      <Leaf className="size-4 text-ayura-green" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Capacity {t.slotCapacity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-ayura-green">
                      ₹{t.fee.toLocaleString("en-IN")}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="export" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Download className="size-4 text-ayura-green" />
                  Export Invoice Data
                </CardTitle>
                <CardDescription className="text-xs">
                  Download invoice records for accounting.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-xs">From</Label>
                    <Input
                      type="date"
                      className="h-9 mt-1"
                      value={exportRange.from}
                      onChange={(e) =>
                        setExportRange({ ...exportRange, from: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">To</Label>
                    <Input
                      type="date"
                      className="h-9 mt-1"
                      value={exportRange.to}
                      onChange={(e) => setExportRange({ ...exportRange, to: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-10 gap-2"
                    onClick={async () => {
                      await exportInvoicesCsv(
                        exportRange.from
                          ? new Date(exportRange.from).getTime()
                          : undefined,
                        exportRange.to
                          ? new Date(exportRange.to).getTime()
                          : undefined,
                      );
                      toast.success("CSV exported");
                    }}
                  >
                    <FileText className="size-4" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-10 gap-2"
                    onClick={async () => {
                      await exportInvoicesXlsx(
                        exportRange.from
                          ? new Date(exportRange.from).getTime()
                          : undefined,
                        exportRange.to
                          ? new Date(exportRange.to).getTime()
                          : undefined,
                      );
                      toast.success("XLSX exported");
                    }}
                  >
                    <FileSpreadsheet className="size-4" />
                    Export XLSX
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Clinic settings tab ──────────────────────────────────────── */}
          <TabsContent value="clinic" className="mt-4">
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <QrCode className="size-4 text-ayura-green" />
                    Payment QR Code
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Paste a UPI QR image URL (Google Pay, PhonePe, etc.) to show in the Payment QR FAB.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-0">
                  <Input
                    placeholder="https://… or data:image/png;base64,…"
                    value={paymentQrUri}
                    onChange={(e) => setPaymentQrUri(e.target.value)}
                  />
                  {paymentQrUri && (
                    <div className="rounded-xl border border-border overflow-hidden w-fit">
                      <img
                        src={paymentQrUri}
                        alt="Payment QR preview"
                        className="size-32 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="gradient-ayura text-white border-0 h-9 self-start"
                    onClick={async () => {
                      try {
                        if (!settings) return;
                        await db.clinicSettings.update(settings.id, {
                          paymentQrUri: paymentQrUri.trim() || undefined,
                        });
                        await reloadSettings();
                        toast.success("Payment QR saved");
                      } catch {
                        toast.error("Failed to save QR");
                      }
                    }}
                  >
                    Save QR
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
