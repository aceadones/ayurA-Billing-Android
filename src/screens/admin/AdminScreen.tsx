import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  KeyRound,
  UserRound,
  Stethoscope,
  Download,
  Plus,
  FileSpreadsheet,
  FileText,
  ChevronRight,
  Leaf,
  Settings,
  Shield,
} from "lucide-react";

const DOCTORS = [
  { name: "Dr. Veda Gayathri S", speciality: "Panchakarma", status: "active" },
];

const TREATMENTS = [
  { name: "Panchakarma", duration: "60 min", price: 3000 },
  { name: "Abhyanga", duration: "45 min", price: 1500 },
  { name: "Shirodhara", duration: "45 min", price: 2000 },
  { name: "Nadi Pariksha", duration: "20 min", price: 500 },
];

export function AdminScreen() {
  return (
    <AppShell title="Admin" subtitle="Clinic administration" currentRole="admin" onLock={() => {}}>
      <div className="screen-pad flex flex-col gap-4">
        <Tabs defaultValue="security">
          <TabsList className="grid grid-cols-4 w-full">
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
          </TabsList>

          {/* Security — Change PINs */}
          <TabsContent value="security" className="mt-4">
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <KeyRound className="size-4 text-ayura-green" />
                    Front Desk PIN
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Used by front desk staff to unlock billing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-0">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="currentPin" className="text-xs">Current PIN</Label>
                    <Input id="currentPin" type="password" placeholder="Current PIN" className="h-9" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="newPin" className="text-xs">New PIN</Label>
                    <Input id="newPin" type="password" placeholder="Min. 4 digits" className="h-9" />
                  </div>
                  <Button size="sm" className="gradient-ayura text-white border-0 h-9 self-start">
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
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="curAdminPass" className="text-xs">Current Password</Label>
                    <Input id="curAdminPass" type="password" className="h-9" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="newAdminPass" className="text-xs">New Password</Label>
                    <Input id="newAdminPass" type="password" placeholder="Min. 8 chars" className="h-9" />
                  </div>
                  <Button size="sm" className="gradient-ayura text-white border-0 h-9 self-start">
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Doctors */}
          <TabsContent value="doctors" className="mt-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-end">
                <Button size="sm" className="gradient-ayura text-white border-0 h-8 gap-1.5">
                  <Plus className="size-3.5" />
                  Add Doctor
                </Button>
              </div>
              {DOCTORS.map((d) => (
                <Card key={d.name}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="p-2.5 bg-ayura-green-light rounded-xl shrink-0">
                      <Stethoscope className="size-4 text-ayura-green" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.speciality}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="size-8 p-0">
                      <ChevronRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Treatments */}
          <TabsContent value="treatments" className="mt-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-end">
                <Button size="sm" className="gradient-ayura text-white border-0 h-8 gap-1.5">
                  <Plus className="size-3.5" />
                  Add Treatment
                </Button>
              </div>
              {TREATMENTS.map((t) => (
                <Card key={t.name}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="p-2.5 bg-ayura-green-light rounded-xl shrink-0">
                      <Leaf className="size-4 text-ayura-green" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.duration}</p>
                    </div>
                    <span className="text-sm font-semibold text-ayura-green">
                      ₹{t.price.toLocaleString("en-IN")}
                    </span>
                    <Button variant="ghost" size="sm" className="size-8 p-0">
                      <ChevronRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Export */}
          <TabsContent value="export" className="mt-4">
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Download className="size-4 text-ayura-green" />
                    Export Invoice Data
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Download all invoice records for accounting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-0">
                  <div className="flex gap-3">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <Label htmlFor="fromDate" className="text-xs">From</Label>
                      <Input id="fromDate" type="date" className="h-9 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <Label htmlFor="toDate" className="text-xs">To</Label>
                      <Input id="toDate" type="date" className="h-9 text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-10 gap-2">
                      <FileText className="size-4" />
                      Export CSV
                    </Button>
                    <Button variant="outline" className="flex-1 h-10 gap-2">
                      <FileSpreadsheet className="size-4" />
                      Export XLSX
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
