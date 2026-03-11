import { Button } from "@/components/ui/button";

const avatars = [
  "/avatars/friend4.jpg",
  "/avatars/friend3.jpg",
  "/avatars/friend2.jpg",
  "/avatars/friend1.jpg",
];

const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center px-6 pb-20 pt-24 text-center">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="blur" x="0" y="0">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
            </filter>
          </defs>
          <path
            d="M0,160 Q360,120 720,160 T1440,160 V320 H0 Z"
            fill="#ff6b35"
            filter="url(#blur)"
            className="animate-wave1"
          />
          <path
            d="M0,200 Q360,160 720,200 T1440,200 V320 H0 Z"
            fill="#ff4500"
            filter="url(#blur)"
            opacity="0.7"
            className="animate-wave2"
          />
        </svg>
      </div>
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
        I help Company, brands and startups grow faster with data-driven marketing, creative strategy and performance scaling.
      </p>

      <div className="mt-10 flex items-center gap-4">
        <Button onClick={() => window.location.href = "/start-scaling"} className="rounded-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90">
          Book a call
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" })
          }
          className="rounded-full border-border px-8 py-6 text-base font-semibold text-foreground hover:bg-secondary"
        >
          Learn More
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
