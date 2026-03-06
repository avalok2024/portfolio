const partners = [
  "Shopify Partners",
  "Marketing Partner",
  "Google Partner",
  "Meta Business Partner",
];

const PartnersBar = () => {
  return (
    <section className="border-y border-border/50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          You're in good hands
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {partners.map((p) => (
            <span
              key={p}
              className="text-sm font-semibold text-muted-foreground/60"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersBar;
