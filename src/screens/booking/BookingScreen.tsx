import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate, formatTime } from "@/lib/utils";
import {
  Plus,
  CalendarDays,
  Clock,
  UserRound,
  Stethoscope,
  Leaf,
  ChevronRight,
  MapPin,
} from "lucide-react";

const TREATMENT_BOOKINGS = [
  { id: "TB-001", patient: "Anjali M.", treatment: "Panchakarma – Day 3", date: new Date(), slot: "09:00 AM", doctor: "Dr. Veda", status: "confirmed" },
  { id: "TB-002", patient: "Rajan K.", treatment: "Abhyanga Massage", date: new Date(), slot: "11:30 AM", doctor: "Dr. Veda", status: "confirmed" },
  { id: "TB-003", patient: "Priya S.", treatment: "Shirodhara – Day 1", date: new Date(Date.now() + 86400000), slot: "10:00 AM", doctor: "Dr. Veda", status: "pending" },
];

const DOCTOR_BOOKINGS = [
  { id: "DB-001", patient: "Suresh V.", date: new Date(), slot: "02:00 PM", doctor: "Dr. Veda", status: "confirmed" },
  { id: "DB-002", patient: "Meena L.", date: new Date(), slot: "03:30 PM", doctor: "Dr. Veda", status: "confirmed" },
];

const STATUS_STYLES: Record<string, string> = {
  confirmed: "status-active",
  pending: "status-pending",
  cancelled: "status-cancelled",
};

export function BookingScreen() {
  return (
    <AppShell title="Booking" subtitle="Appointments & treatments" currentRole="front-desk" onLock={() => {}}>
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
            <Button size="sm" className="gradient-ayura text-white border-0 h-8 gap-1.5">
              <Plus className="size-3.5" />
              New Booking
            </Button>
          </div>

          {/* Treatment bookings */}
          <TabsContent value="treatments" className="mt-4">
            <div className="flex flex-col gap-3">
              {TREATMENT_BOOKINGS.map((b) => (
                <Card key={b.id} className="overflow-hidden">
                  <div className="h-0.5 bg-ayura-green" />
                  <CardContent className="py-3 px-4 flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0 text-center min-w-[48px]">
                      <span className="text-xs font-semibold text-ayura-green">
                        {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{b.slot}</span>
                    </div>

                    <div className="w-px h-10 bg-border shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{b.patient}</p>
                        <Badge variant="outline" className={cn("text-[10px]", STATUS_STYLES[b.status])}>
                          {b.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <Leaf className="size-3 text-ayura-green" />
                        {b.treatment}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Stethoscope className="size-3" />
                        {b.doctor}
                      </p>
                    </div>

                    <Button variant="ghost" size="sm" className="size-8 p-0">
                      <ChevronRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Doctor bookings */}
          <TabsContent value="doctors" className="mt-4">
            <div className="flex flex-col gap-3">
              {DOCTOR_BOOKINGS.map((b) => (
                <Card key={b.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-4">
                    <div className="p-2.5 bg-ayura-green-light rounded-xl shrink-0">
                      <UserRound className="size-4 text-ayura-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{b.patient}</p>
                        <Badge variant="outline" className={cn("text-[10px]", STATUS_STYLES[b.status])}>
                          {b.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <Clock className="size-3" />
                        {b.slot} · {b.doctor}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="size-8 p-0">
                      <ChevronRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
