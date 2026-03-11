import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Stat {
  value: string;
  label: string;
}

interface BarData {
  height: number;
  active?: boolean;
}

interface ClientEntry {
  pill: string;
  name: string;
  description: string;
  stats: [Stat, Stat];
  image: { src: string; alt: string };
  chart: { title: string; bars: BarData[] };
  highlight: { value: string; label: string };
}

const clients: ClientEntry[] = [
  {
    pill: "E-Commerce",
    name: "Nova Commerce",
    description:
      "We launched three creative angles, rebuilt the landing page narrative, and refreshed retargeting sequences. The result is faster conversion velocity with stronger repeat purchase intent.",
    stats: [
      { value: "+158%", label: "Revenue Growth" },
      { value: "4.8x", label: "Blended ROAS" },
    ],
    image: {
      src: "https://storage.googleapis.com/banani-generated-images/generated-images/85ef7b51-5792-4105-87eb-5775fe1171f2.jpg",
      alt: "Nova Commerce product showcase",
    },
    chart: {
      title: "8-Month Revenue Trend",
      bars: [
        { height: 30 },
        { height: 45 },
        { height: 60 },
        { height: 75 },
        { height: 100, active: true },
      ],
    },
    highlight: { value: "18.2%", label: "Lead to purchase rate" },
  },
//   {
//     pill: "DTC Beauty",
//     name: "Aura Skincare",
//     description:
//       "Shifted acquisition focus from broad awareness to high-intent problem solving. Implemented a robust quiz funnel and retention flows to maximize customer lifetime value.",
//     stats: [
//       { value: "220%", label: "D2C Scale" },
//       { value: "+$34", label: "AOV Lift" },
//     ],
//     image: {
//       src: "https://storage.googleapis.com/banani-generated-images/generated-images/774e5254-95b4-4e9f-8f80-52b6b6e92181.jpg",
//       alt: "Aura Skincare product",
//     },
//     chart: {
//       title: "Customer Acquisition",
//       bars: [
//         { height: 20 },
//         { height: 40 },
//         { height: 70 },
//         { height: 100, active: true },
//       ],
//     },
//     highlight: { value: "42%", label: "Creative win rate" },
//   },
//   {
//     pill: "Health & Wellness",
//     name: "Lumina Health",
//     description:
//       "Designed a subscription-first model with bespoke landing pages for each product tier. Leveraged UGC to build trust and cut CPA in half within 90 days.",
//     stats: [
//       { value: "-52%", label: "CPA Reduction" },
//       { value: "62%", label: "Subscription Rate" },
//     ],
//     image: {
//       src: "https://storage.googleapis.com/banani-generated-images/generated-images/a9ebbd46-7799-4a52-bd4a-dcfafd9e5ef0.jpg",
//       alt: "Lumina Health supplement",
//     },
//     chart: {
//       title: "Active Subscribers",
//       bars: [
//         { height: 40 },
//         { height: 55 },
//         { height: 65 },
//         { height: 80 },
//         { height: 100, active: true },
//       ],
//     },
//     highlight: { value: "$2M+", label: "ARR Run Rate" },
//   },
];

const PortfolioSection = () => {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">

        {/* Hero */}
        <div className="mb-16 flex flex-col items-center text-center">
          <Badge className="mb-4 rounded-full border-border bg-secondary text-muted-foreground hover:bg-secondary">
            Agency Portfolio
          </Badge>
          <h2 className="text-4xl font-black uppercase leading-tight tracking-tight text-foreground md:text-6xl">
            Track records,{" "}
            <span className="font-normal normal-case italic text-muted-foreground">
              not promises.
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Dive into the month-by-month execution timelines, creative launches,
            and revenue shifts for the brands we actively scale.
          </p>
        </div>

        {/* Client Cards */}
        <div className="flex flex-col gap-8">
          {clients.map((client, index) => {
            const reversed = index % 2 !== 0;
            return (
              <div
                key={client.name}
                className="grid items-center gap-12 rounded-2xl border border-border bg-secondary/30 p-8 md:grid-cols-2"
              >
                {/* Info */}
                <div className={`flex flex-col gap-5 ${reversed ? "md:order-2" : ""}`}>
                  <Badge className="w-fit rounded-full border-border bg-secondary text-muted-foreground hover:bg-secondary">
                    {client.pill}
                  </Badge>

                  <h3 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
                    {client.name}
                  </h3>

                  <p className="text-muted-foreground">{client.description}</p>

                  {/* Stats */}
                  <div className="flex gap-8 border-b border-border pb-6">
                    {client.stats.map((stat) => (
                      <div key={stat.label}>
                        <p className="text-2xl font-black text-primary">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <Button className="w-fit rounded-full bg-primary px-6 py-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                    View growth timeline
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {/* Visual Bento */}
                <div
                  className={`grid gap-3 ${reversed ? "md:order-1" : ""}`}
                  style={{
                    gridTemplateColumns: "1fr 0.6fr",
                    gridTemplateRows: "220px 160px",
                  }}
                >
                  {/* Tall image — spans both rows */}
                  <div
                    className="overflow-hidden rounded-2xl border border-border bg-secondary"
                    style={{ gridRow: "1 / 3" }}
                  >
                    <img
                      src={client.image.src}
                      alt={client.image.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Bar chart */}
                  <div className="flex flex-col justify-end rounded-2xl border border-border bg-secondary/50 p-4">
                    <p className="mb-auto text-xs text-muted-foreground">
                      {client.chart.title}
                    </p>
                    <div className="flex h-20 items-end gap-1.5">
                      {client.chart.bars.map((bar, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-primary"
                          style={{
                            height: `${bar.height}%`,
                            opacity: bar.active ? 1 : 0.4,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Highlight stat */}
                  <div className="flex flex-col justify-center rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <p className="text-3xl font-black text-primary">{client.highlight.value}</p>
                    <p className="text-xs font-medium text-foreground">{client.highlight.label}</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        {/* <div className="mt-20 flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-5xl">
            Ready to build your timeline?
          </h2>
          <p className="max-w-md text-muted-foreground">
            We partner with a select group of ambitious founders each quarter.
          </p>
          <Button className="mt-2 rounded-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90">
            Book a discovery call
          </Button>
        </div> */}

      </div>
    </section>
  );
};

export default PortfolioSection;