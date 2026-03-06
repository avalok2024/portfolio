import { Button } from "@/components/ui/button";

const avatars = [
  "/avatars/friend4.jpg",
  "/avatars/friend3.jpg",
  "/avatars/friend2.jpg",
  "/avatars/friend1.jpg",
];

const HeroSection = () => {
  return (
    <section className="flex flex-col items-center px-6 pb-20 pt-24 text-center">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex -space-x-3">
          {avatars.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Client"
              className="h-8 w-8 rounded-full border-2 border-background"
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">1000+ Trusted Peoples</span>
      </div>

      <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
        Ready to{" "}
        <em className="not-italic font-extrabold" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
          scale
        </em>{" "}
        your brand with growth?
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
        We help Comapny, brands and startups grow faster with data-driven marketing, creative strategy and performance scaling.
      </p>

      <div className="mt-10 flex items-center gap-4">
        <Button className="rounded-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90">
          Book a call
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-border px-8 py-6 text-base font-semibold text-foreground hover:bg-secondary"
        >
          Learn More
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
