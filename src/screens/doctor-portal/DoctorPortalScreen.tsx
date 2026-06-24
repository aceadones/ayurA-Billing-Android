import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatTime } from "@/lib/utils";
import {
  Plus,
  CalendarDays,
  Clock,
  UserRound,
  ChevronRight,
  CalendarClock,
  BanIcon,
  Pencil,
  LayoutList,
} from "lucide-react";

const TODAY_APPTS = [
  { id: "A01", patient: "Kavitha R.", time: "09:00 AM", type: "Nadi Pariksha", status: "waiting" },
  { id: "A02", patient: "Suresh M.", time: "10:00 AM", type: "Follow-up", status: "in-progress" },
  { id: "A03", patient: "Anjali V.", time: "11:00 AM", type: "Panchakarma Consult", status: "scheduled" },
  { id: "A04", patient: "Rajan K.", time: "02:00 PM", type: "New Patient", status: "scheduled" },
  { id: "A05", patient: "Priya S.", time: "03:30 PM", type: "Follow-up", status: "scheduled" },
];

const UPCOMING = [
  { date: "Tomorrow", patient: "Meena L.", time: "10:00 AM", type: "Panchakarma Day 2" },
  { date: "27 Jun", patient: "Vivek T.", time: "09:30 AM", type: "New Patient" },
];

const OVERRIDES = [
  { id: "O1", date: "26 Jun", from: "02:00 PM", to: "04:00 PM", reason: "CME Conference" },
];

const APPT_STATUS: Record<string, string> = {
  waiting: "status-pending",
  "in-progress": "bg-sky-50 text-sky-700 border-sky-200",
  scheduled: "bg-muted text-muted-foreground border-border",
  done: "status-active",
};

export function DoctorPortalScreen() {
  return (
    <AppShell title="Doctor Portal" subtitle="Dr. Veda Gayathri S" currentRole="doctor" onLock={() => {}}>
      <div className="screen-pad flex flex-col gap-4">
        <Tabs defaultValue="today">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="overrides">Overrides</TabsTrigger>
            </TabsList>
            <Button size="sm" className="gradient-ayura text-white border-0 h-8 gap-1.5">
              <Plus className="size-3.5" />
              Walk-in
            </Button>
          </div>

          {/* Today */}
          <TabsContent value="today" className="mt-4">
            <div className="flex flex-col gap-2">
              {TODAY_APPTS.map((a) => (
                <Card key={a.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="flex flex-col items-center min-w-[52px] shrink-0">
                      <Clock className="size-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium mt-0.5">{a.time}</span>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{a.patient}</span>
                        <Badge variant="outline" className={cn("text-[10px]", APPT_STATUS[a.status])}>
                          {a.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{a.type}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="size-8 p-0">
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="size-8 p-0">
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Upcoming */}
          <TabsContent value="upcoming" className="mt-4">
            <div className="flex flex-col gap-2">
              {UPCOMING.map((a, i) => (
                <Card key={i}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="p-2 bg-ayura-green-light rounded-lg shrink-0">
                      <CalendarDays className="size-4 text-ayura-green" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{a.patient}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.date} · {a.time} · {a.type}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="size-8 p-0">
                      <Pencil className="size-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Availability overrides */}
          <TabsContent value="overrides" className="mt-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                  <Plus className="size-3.5" />
                  Add Override
                </Button>
              </div>
              {OVERRIDES.map((o) => (
                <Card key={o.id} className="border-orange-200 bg-orange-50/30">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg shrink-0">
                      <BanIcon className="size-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-orange-800">{o.date}</p>
                      <p className="text-xs text-orange-600">
                        {o.from} – {o.to} · {o.reason}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="size-8 p-0 text-muted-foreground">
                      <Pencil className="size-3.5" />
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
