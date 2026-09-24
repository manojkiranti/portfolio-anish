import { Calculator, ClipboardCheck, Gauge, Info, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/sections/about";
import { ServiceabilityCalculator } from "@/components/calculators/serviceability";
import { RepaymentCalculator } from "@/components/calculators/repayments";
import { LvrDtiCalculator } from "@/components/calculators/lvr-dti";
import { FileReadinessChecklist } from "@/components/calculators/file-readiness";
import { toolkit } from "@/lib/content";

const TOOLS = [
  { value: "serviceability", label: "Serviceability", icon: Wallet, Tool: ServiceabilityCalculator },
  { value: "repayments", label: "Repayments", icon: Calculator, Tool: RepaymentCalculator },
  { value: "lvr-dti", label: "LVR & DTI", icon: Gauge, Tool: LvrDtiCalculator },
  { value: "readiness", label: "File readiness", icon: ClipboardCheck, Tool: FileReadinessChecklist },
];

export function Toolkit() {
  return (
    <section id="toolkit" className="py-20 sm:py-28 bg-secondary/40">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeading eyebrow={toolkit.eyebrow} heading={toolkit.heading} />
        <p className="-mt-3 mb-8 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          {toolkit.intro}
        </p>

        <Tabs defaultValue="serviceability">
          <TabsList aria-label="Credit tools">
            {TOOLS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TOOLS.map(({ value, Tool }) => (
            <TabsContent key={value} value={value} forceMount>
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                <Tool />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <p className="mt-5 flex gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {toolkit.disclaimer}
        </p>
      </div>
    </section>
  );
}
