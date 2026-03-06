const partners = [
  { name: "Coins.me", logo: "/logos/coins.me.png" },
  { name: "P2P.me", logo: "/logos/p2pdotme.png" },
  { name: "P2P Foundation", logo: "/logos/p2pfoundation.png" },
  { name: "Cryptoholic", logo: "/logos/cryptoholic.png" },
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
            <div
              key={p.name}
              className="flex items-center justify-center w-32 h-12"
            >
              <img
                src={p.logo}
                alt={p.name}
                className="max-h-10 w-auto object-contain grayscale hover:grayscale-0 transition"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersBar;
