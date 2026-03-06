import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";

const otherItems = [
  "Generic strategies for all clients",
  "Slow response times & poor communication",
  "No real transparency on ad spend",
  "Vanity metrics without real ROI tracking",
  "Locked into long-term contracts",
];

const conversionItems = [
  "Tailored strategies for your brand",
  "Dedicated account manager, fast replies",
  "Full transparency on every dollar spent",
  "Focus on ROAS, CAC, and real revenue",
  "Flexible month-to-month agreements",
];

const ComparisonSection = () => {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <Badge className="mb-4 rounded-full border-border bg-secondary text-muted-foreground hover:bg-secondary">
          Consultation
        </Badge>
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold text-foreground md:text-5xl">
          But, why would you want to work{" "}
          <em style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
            with us
          </em>
          ?
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {/* Other Agencies */}
          <div className="rounded-2xl border border-border bg-card p-8 text-left">
            <h3 className="mb-6 text-lg font-bold text-muted-foreground">Other Agencies</h3>
            <ul className="space-y-4">
              {otherItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground/60">
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/40" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Conversion */}
          <div className="rounded-2xl border border-primary/30 bg-card p-8 text-left">
            <h3 className="mb-6 text-lg font-bold text-foreground">Conversion</h3>
            <ul className="space-y-4">
              {conversionItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;

