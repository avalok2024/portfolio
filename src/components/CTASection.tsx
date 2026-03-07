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
          <div className="w-full max-w-md mx-auto rounded-2xl bg-zinc-900/70 backdrop-blur-md border border-zinc-800 p-6 sm:p-8 space-y-6">

            {/* Header */}
            <div>
              <p className="text-red-400 text-xs tracking-widest uppercase mb-2">
                Available this week
              </p>

              <h3 className="text-lg font-semibold">
                Schedule a Discovery Call
              </h3>

              <p className="text-sm text-zinc-400">
                Select your preferred day & time
              </p>
            </div>

            {/* Days */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                <button
                  key={day}
                  className="py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["10:00 AM", "2:00 PM", "4:00 PM"].map((time) => (
                <button
                  key={time}
                  className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm"
                >
                  {time}
                </button>
              ))}
            </div>

            <p className="text-xs text-zinc-500 text-center">
              *All times shown are in Indian Standard Time (IST, UTC+5)
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-zinc-800">

              <div>
                <p className="text-red-400 text-xl font-bold">4+</p>
                <p className="text-xs text-zinc-400"> Company/Startup Served</p>
              </div>

              <div>
                <p className="text-red-400 text-xl font-bold">20+</p>
                <p className="text-xs text-zinc-400">Growth Campaigns</p>
              </div>

              <div>
                <p className="text-red-400 text-xl font-bold">5+</p>
                <p className="text-xs text-zinc-400">Global Efforts</p>
              </div>

            </div>

            <p className="text-xs text-center text-zinc-500">
              ✓ Free consultation · No commitment
            </p>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
