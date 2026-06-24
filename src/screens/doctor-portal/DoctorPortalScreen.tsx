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
import { db } from "@/db/database";
import { useAppShell } from "@/hooks/use-app-shell";
import {
  addAvailabilityOverride,
  addWalkInAppointment,
  startOfToday,
} from "@/services/booking-service";
import { cn } from "@/lib/utils";
import {
  Plus,
  Clock,
  CalendarDays,
  BanIcon,
  Pencil,
  ChevronRight,
} from "lucide-react";

const APPT_STATUS: Record<string, string> = {
  waiting: "status-pending",
  "in-progress": "bg-sky-50 text-sky-700 border-sky-200",
  scheduled: "bg-muted text-muted-foreground border-border",
  confirmed: "status-active",
};

export function DoctorPortalScreen() {
  const shell = useAppShell("Doctor Portal");
  const doctors = useLiveQuery(() => db.doctors.filter((d) => d.active).toArray(), []);
  const doctor = doctors?.[0];
  const today = startOfToday();

  const todayBookings = useLiveQuery(
    () =>
      db.doctorBookings
        .where("dateEpoch")
        .equals(today)
        .filter((b) => (doctor ? b.doctorId === doctor.id : true))
        .toArray(),
    [today, doctor?.id],
  );

  const upcomingBookings = useLiveQuery(
    () =>
      db.doctorBookings
        .filter((b) => b.dateEpoch > today && (doctor ? b.doctorId === doctor.id : true))
        .toArray(),
    [today, doctor?.id],
  );

  const overrides = useLiveQuery(
    () =>
      db.doctorAvailabilityOverrides
        .filter((o) => (doctor ? o.doctorId === doctor.id : true))
        .toArray(),
    [doctor?.id],
  );

  const [walkInOpen, setWalkInOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [walkIn, setWalkIn] = useState({ patientName: "", timeText: "11:00 AM" });
  const [overrideForm, setOverrideForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: "02:00 PM",
    endTime: "04:00 PM",
    reason: "",
  });

  const subtitle = doctor?.name ?? "Doctor schedule";

  return (
    <AppShell {...shell} subtitle={subtitle}>
      <div className="screen-pad flex flex-col gap-4">
        <Tabs defaultValue="today">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="overrides">Overrides</TabsTrigger>
            </TabsList>
            <Button
              size="sm"
              className="gradient-ayura text-white border-0 h-8 gap-1.5"
              onClick={() => setWalkInOpen(true)}
              disabled={!doctor}
            >
              <Plus className="size-3.5" />
              Walk-in
            </Button>
          </div>

          <TabsContent value="today" className="mt-4">
            <div className="flex flex-col gap-2">
              {(todayBookings ?? []).map((a) => (
                <Card key={a.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="flex flex-col items-center min-w-[52px] shrink-0">
                      <Clock className="size-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium mt-0.5">{a.timeText}</span>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{a.patientName}</span>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", APPT_STATUS[a.status] ?? APPT_STATUS.scheduled)}
                        >
                          {a.status}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
              {(todayBookings ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No appointments today.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4">
            <div className="flex flex-col gap-2">
              {(upcomingBookings ?? []).map((a) => (
                <Card key={a.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="p-2 bg-ayura-green-light rounded-lg shrink-0">
                      <CalendarDays className="size-4 text-ayura-green" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{a.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.dateEpoch).toLocaleDateString("en-IN")} · {a.timeText}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="overrides" className="mt-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => setOverrideOpen(true)}
                  disabled={!doctor}
                >
                  <Plus className="size-3.5" />
                  Add Override
                </Button>
              </div>
              {(overrides ?? []).map((o) => (
                <Card key={o.id} className="border-orange-200 bg-orange-50/30">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg shrink-0">
                      <BanIcon className="size-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-orange-800">
                        {new Date(o.dateEpoch).toLocaleDateString("en-IN")}
                      </p>
                      <p className="text-xs text-orange-600">
                        {o.startTime} – {o.endTime}
                        {o.reason ? ` · ${o.reason}` : ""}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={walkInOpen} onOpenChange={setWalkInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add walk-in</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Patient name"
              value={walkIn.patientName}
              onChange={(e) => setWalkIn({ ...walkIn, patientName: e.target.value })}
            />
            <Input
              placeholder="Time"
              value={walkIn.timeText}
              onChange={(e) => setWalkIn({ ...walkIn, timeText: e.target.value })}
            />
            <Button
              className="gradient-ayura text-white border-0"
              onClick={async () => {
                if (!doctor) return;
                try {
                  await addWalkInAppointment({
                    doctorId: doctor.id,
                    patientName: walkIn.patientName,
                    timeText: walkIn.timeText,
                  });
                  toast.success("Walk-in added");
                  setWalkInOpen(false);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Failed");
                }
              }}
            >
              Add to today
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Availability override</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              type="date"
              value={overrideForm.date}
              onChange={(e) => setOverrideForm({ ...overrideForm, date: e.target.value })}
            />
            <Input
              placeholder="Start time"
              value={overrideForm.startTime}
              onChange={(e) => setOverrideForm({ ...overrideForm, startTime: e.target.value })}
            />
            <Input
              placeholder="End time"
              value={overrideForm.endTime}
              onChange={(e) => setOverrideForm({ ...overrideForm, endTime: e.target.value })}
            />
            <Input
              placeholder="Reason"
              value={overrideForm.reason}
              onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
            />
            <Button
              className="gradient-ayura text-white border-0"
              onClick={async () => {
                if (!doctor) return;
                try {
                  await addAvailabilityOverride({
                    doctorId: doctor.id,
                    dateEpoch: new Date(overrideForm.date).setHours(0, 0, 0, 0),
                    startTime: overrideForm.startTime,
                    endTime: overrideForm.endTime,
                    reason: overrideForm.reason,
                  });
                  toast.success("Override saved");
                  setOverrideOpen(false);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Failed");
                }
              }}
            >
              Save override
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
