import { Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Section } from "@/components/sections/section";
import { ServiceabilityCalculator } from "@/components/calculators/serviceability";
import { RepaymentCalculator } from "@/components/calculators/repayments";
import { LvrDtiCalculator } from "@/components/calculators/lvr-dti";
import { FileReadinessChecklist } from "@/components/calculators/file-readiness";
import { toolkit } from "@/lib/content";

const TOOLS = [
  { value: "serviceability", label: "Serviceability", Tool: ServiceabilityCalculator },
  { value: "repayments", label: "Repayments", Tool: RepaymentCalculator },
  { value: "lvr-dti", label: "LVR & DTI", Tool: LvrDtiCalculator },
  { value: "readiness", label: "File readiness", Tool: FileReadinessChecklist },
];

export function Toolkit() {
  return (
    <Section id="toolkit" heading={toolkit.heading} note={toolkit.intro}>
      <Tabs defaultValue="serviceability">
        <TabsList aria-label="Credit tools">
          {TOOLS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TOOLS.map(({ value, Tool }) => (
          <TabsContent key={value} value={value} forceMount>
            <Tool />
          </TabsContent>
        ))}
      </Tabs>
      <p className="mt-6 flex gap-2 text-xs leading-relaxed text-muted-foreground">
        <Info aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {toolkit.disclaimer}
      </p>
    </Section>
  );
}
