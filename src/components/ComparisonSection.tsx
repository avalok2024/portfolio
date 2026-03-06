import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";

const otherItems = [
  "Generic marketing strategies used for every client",
  "Slow responses and poor communication",
  "Limited visibility into ad performance",
  "Focus on vanity metrics like clicks and impressions",
  "Long-term contracts with no real accountability",
];

const conversionItems = [
  "Custom growth strategies built for your brand",
  "Fast, direct communication and dedicated support",
  "Complete transparency on every dollar spent",
  "Focus on real business metrics: ROAS, CAC & revenue",
  "Flexible month-to-month partnership — no lock-ins",
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
            with me
          </em>
          ?
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {/* Other Agencies */}
          <div className="rounded-2xl border border-border bg-card p-8 text-left">
            <h3 className="mb-6 text-lg font-bold text-muted-foreground">Others</h3>
            <ul className="space-y-4">
              {otherItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground/60">
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/40" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Av Alok */}
          <div className="rounded-2xl border border-primary/30 bg-card p-8 text-left">
            <h3 className="mb-6 text-lg font-bold text-foreground">Av Alok</h3>
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

