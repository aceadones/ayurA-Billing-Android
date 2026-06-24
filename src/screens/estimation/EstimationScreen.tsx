import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  FileText,
  IndianRupee,
  UserRound,
  Pill,
  Stethoscope,
  MessageCircle,
  Info,
} from "lucide-react";

export function EstimationScreen() {
  return (
    <AppShell title="Estimation" subtitle="Non-binding cost estimate" currentRole="front-desk" onLock={() => {}}>
      <div className="screen-pad grid landscape:grid-cols-[1fr_300px] gap-5">
        <div className="flex flex-col gap-4">
          {/* Notice */}
          <div className="flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
            <Info className="size-4 text-sky-600 shrink-0" />
            <p className="text-xs text-sky-700">
              Estimates are for quoting purposes only. No payment is recorded.
            </p>
          </div>

          {/* Patient */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ayura-green-light rounded-lg">
                  <UserRound className="size-4 text-ayura-green" />
                </div>
                <Input placeholder="Patient / prospect name" className="h-9 text-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Add items */}
          <div className="flex gap-2">
            {[
              { label: "Medicine", icon: Pill },
              { label: "Treatment", icon: Stethoscope },
              { label: "Consultation", icon: MessageCircle },
            ].map(({ label, icon: Icon }) => (
              <Button key={label} variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <Plus className="size-3.5" />
                <Icon className="size-3.5" />
                {label}
              </Button>
            ))}
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="p-4 bg-muted rounded-2xl">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Add items to build the estimate.</p>
          </div>
        </div>

        {/* Summary */}
        <Card className="self-start sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IndianRupee className="size-4 text-ayura-green" />
              Estimate Total
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-0">
            {[
              ["Subtotal", 0],
              ["GST (5%)", 0],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between text-sm text-muted-foreground">
                <span>{label}</span>
                <span>{formatCurrency(val as number)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total Estimate</span>
              <span className="text-ayura-green">{formatCurrency(0)}</span>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Button className="w-full gradient-ayura text-white border-0 h-10" disabled>
                <FileText className="size-4 mr-2" />
                Save Estimate
              </Button>
              <Button variant="outline" className="w-full h-9 text-sm" disabled>
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
