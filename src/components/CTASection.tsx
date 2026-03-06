import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "200+", label: "Brands Served" },
  { value: "500+", label: "Growth Campaigns" },
  { value: "30+", label: "Global Efforts" },
];

const CTASection = () => {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Left */}
          <div>
            <Badge className="mb-4 rounded-full border-border bg-secondary text-muted-foreground hover:bg-secondary">
              Built for real brands
            </Badge>
            <h2 className="text-3xl font-black uppercase leading-tight tracking-tight text-foreground md:text-5xl">
              READY TO OUTGROW YOUR CATEGORY?
            </h2>
            <p className="mt-6 text-muted-foreground">
              Partner with a team that's obsessed with your growth. We combine creative strategy
              with performance marketing to deliver results that matter.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Button className="rounded-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90">
                Start Scaling Today
              </Button>
              <a href="#" className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
                View Our Process
              </a>
            </div>
          </div>

          {/* Right - Scheduling widget mockup */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="mb-6 rounded-xl bg-secondary p-6">
              <p className="text-sm font-medium text-muted-foreground">Schedule a Discovery Call</p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                  <div key={d} className="rounded-lg bg-card px-3 py-2 text-center text-xs text-muted-foreground">
                    {d}
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["10:00 AM", "2:00 PM", "4:00 PM"].map((t) => (
                  <div key={t} className="rounded-lg border border-border bg-card px-3 py-2 text-center text-xs text-muted-foreground">
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
