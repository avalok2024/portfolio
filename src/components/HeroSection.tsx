import { Button } from "@/components/ui/button";

const avatars = [
  "https://i.pravatar.cc/40?img=1",
  "https://i.pravatar.cc/40?img=2",
  "https://i.pravatar.cc/40?img=3",
  "https://i.pravatar.cc/40?img=4",
];

const HeroSection = () => {
  return (
    <section className="flex flex-col items-center px-6 pb-20 pt-24 text-center">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex -space-x-2">
          {avatars.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Client"
              className="h-8 w-8 rounded-full border-2 border-background"
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">200+ businesses scaled</span>
      </div>

      <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
        Ready to{" "}
        <em className="not-italic font-extrabold" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
          scale
        </em>{" "}
        your brand with paid ads?
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
        We help e-commerce brands and startups achieve predictable, scalable growth through
        data-driven paid advertising on Meta and Google.
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
