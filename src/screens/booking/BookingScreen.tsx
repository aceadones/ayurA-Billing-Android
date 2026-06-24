import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/db/database";
import { useAppShell } from "@/hooks/use-app-shell";
import {
  addDoctorBooking,
  addTreatmentBooking,
  startOfToday,
} from "@/services/booking-service";
import { cn } from "@/lib/utils";
import {
  Plus,
  Clock,
  UserRound,
  Stethoscope,
  Leaf,
  ChevronRight,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "status-active",
  pending: "status-pending",
  cancelled: "status-cancelled",
};

export function BookingScreen() {
  const shell = useAppShell("Booking", "Appointments & treatments");
  const treatments = useLiveQuery(() => db.treatments.filter((t) => t.active).toArray(), []);
  const doctors = useLiveQuery(() => db.doctors.filter((d) => d.active).toArray(), []);
  const treatmentBookings = useLiveQuery(() => db.treatmentBookings.toArray(), []);
  const doctorBookings = useLiveQuery(() => db.doctorBookings.toArray(), []);

  const treatmentMap = useMemo(
    () => new Map((treatments ?? []).map((t) => [t.id, t.name])),
    [treatments],
  );
  const doctorMap = useMemo(
    () => new Map((doctors ?? []).map((d) => [d.id, d.name])),
    [doctors],
  );

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"treatment" | "doctor">("treatment");
  const [form, setForm] = useState({
    patientName: "",
    treatmentId: "",
    doctorId: "",
    date: new Date().toISOString().slice(0, 10),
    slot: "09:00 AM",
    timeText: "02:00 PM",
  });

  async function handleCreate() {
    try {
      const dateEpoch = new Date(form.date).setHours(0, 0, 0, 0);
      if (mode === "treatment") {
        await addTreatmentBooking({
          patientName: form.patientName,
          treatmentId: form.treatmentId,
          dateEpoch,
          slot: form.slot,
        });
      } else {
        await addDoctorBooking({
          patientName: form.patientName,
          doctorId: form.doctorId,
          dateEpoch,
          timeText: form.timeText,
        });
      }
      toast.success("Booking created");
      setOpen(false);
      setForm({
        patientName: "",
        treatmentId: "",
        doctorId: "",
        date: new Date().toISOString().slice(0, 10),
        slot: "09:00 AM",
        timeText: "02:00 PM",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking failed");
    }
  }

  return (
    <AppShell {...shell}>
      <div className="screen-pad flex flex-col gap-4">
        <Tabs defaultValue="treatments">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="treatments" className="gap-1.5">
                <Leaf className="size-3.5" />
                Treatments
              </TabsTrigger>
              <TabsTrigger value="doctors" className="gap-1.5">
                <Stethoscope className="size-3.5" />
                Doctors
              </TabsTrigger>
            </TabsList>
            <Button
              size="sm"
              className="gradient-ayura text-white border-0 h-8 gap-1.5"
              onClick={() => setOpen(true)}
            >
              <Plus className="size-3.5" />
              New Booking
            </Button>
          </div>

          <TabsContent value="treatments" className="mt-4">
            <div className="flex flex-col gap-3">
              {(treatmentBookings ?? []).map((b) => (
                <Card key={b.id} className="overflow-hidden">
                  <div className="h-0.5 bg-ayura-green" />
                  <CardContent className="py-3 px-4 flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0 text-center min-w-[48px]">
                      <span className="text-xs font-semibold text-ayura-green">
                        {new Date(b.dateEpoch).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{b.slot}</span>
                    </div>
                    <div className="w-px h-10 bg-border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{b.patientName}</p>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", STATUS_STYLES[b.status] ?? "status-pending")}
                        >
                          {b.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {treatmentMap.get(b.treatmentId) ?? "Treatment"}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="doctors" className="mt-4">
            <div className="flex flex-col gap-3">
              {(doctorBookings ?? []).map((b) => (
                <Card key={b.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-4">
                    <div className="p-2.5 bg-ayura-green-light rounded-xl shrink-0">
                      <UserRound className="size-4 text-ayura-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{b.patientName}</p>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", STATUS_STYLES[b.status] ?? "status-pending")}
                        >
                          {b.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <Clock className="size-3" />
                        {b.timeText} · {doctorMap.get(b.doctorId) ?? "Doctor"}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Booking</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "treatment" | "doctor")}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="treatment">Treatment</TabsTrigger>
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
              </TabsList>
            </Tabs>
            <Input
              placeholder="Patient name"
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
            />
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            {mode === "treatment" ? (
              <>
                <Select
                  value={form.treatmentId}
                  onValueChange={(v) => setForm({ ...form, treatmentId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {(treatments ?? []).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Slot e.g. 09:00 AM"
                  value={form.slot}
                  onChange={(e) => setForm({ ...form, slot: e.target.value })}
                />
              </>
            ) : (
              <>
                <Select
                  value={form.doctorId}
                  onValueChange={(v) => setForm({ ...form, doctorId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {(doctors ?? []).map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Time e.g. 02:00 PM"
                  value={form.timeText}
                  onChange={(e) => setForm({ ...form, timeText: e.target.value })}
                />
              </>
            )}
            <Button
              className="gradient-ayura text-white border-0"
              onClick={() => void handleCreate()}
            >
              Create booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
