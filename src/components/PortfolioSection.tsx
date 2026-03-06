import { Badge } from "@/components/ui/badge";

const images = [
  { bg: "from-primary/20 to-primary/5", label: "LESS IS MORE IMPACT" },
  { bg: "from-secondary to-muted", label: "Brand Campaign" },
  { bg: "from-primary/30 to-secondary", label: "Social Ads" },
  { bg: "from-muted to-card", label: "Product Launch" },
  { bg: "from-card to-secondary", label: "Retargeting" },
  { bg: "from-primary/10 to-muted", label: "Awareness" },
  { bg: "from-secondary to-primary/20", label: "Performance" },
];

const PortfolioSection = () => {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <Badge className="mb-4 rounded-full border-border bg-secondary text-muted-foreground hover:bg-secondary">
            Our Work
          </Badge>
          <h2 className="text-3xl font-extrabold text-foreground md:text-5xl">
            Creative{" "}
            <em style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              Excellence
            </em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            A selection of our high-performing creative work across Meta and Google platforms.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={i}
              className={`flex aspect-[3/4] items-end rounded-2xl bg-gradient-to-br ${img.bg} p-4 ${
                i === 0 ? "row-span-2 aspect-auto" : ""
              }`}
            >
              <span className="text-xs font-semibold text-foreground/70">{img.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
