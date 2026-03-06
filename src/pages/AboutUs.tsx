import { CheckCircle, Award, Zap, Link as LinkIcon, Mail, MapPin } from "lucide-react";
import founderImg from "@/assests/founder.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";

const highlights = [
  "Scaled 50+ e-commerce brands past $10M ARR",
  "Managed $100M+ in ad spend across Google & Meta",
  "Former Head of Growth at top-tier agencies",
  "Featured speaker at AdWorld 2024",
];

const expertise = [
  "Performance Marketing",
  "Growth Strategy",
  "Media Buying",
  "CRO",
  "Creative Direction",
  "Data Analytics",
  "Brand Scaling",
  "Team Leadership",
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="text-center py-16 px-4">
        <span className="inline-block rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground mb-6">
          Behind The Growth
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Meet the <span className="font-serif italic font-normal">Lead</span>
        </h1>
        <p className="text-muted-foreground mt-4">
          The driving force behind Conversion's omni-channel success.
        </p>
      </section>

      {/* Founder Bio */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-[420px_1fr] gap-16 items-center">

          <div className="rounded-2xl overflow-hidden bg-secondary aspect-[3/4] w-full">
            <img
              src={founderImg}
              alt="Av Alok"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <p className="text-primary text-sm font-semibold tracking-wide uppercase mb-2">
              Hello, I'm
            </p>

            <h2 className="text-4xl font-bold mb-6">
              Av Alok
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-4">
              With over a decade of experience in paid media and growth strategy, I founded
              Conversion to bridge the gap between creative excellence and data-driven
              performance.
            </p>

            <p className="font-serif italic text-xl text-muted-foreground">
              av alok
            </p>

          </div>

        </div>
      </section>

      {/* Info Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Key Highlights */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Key Highlights</h3>
            </div>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Core Expertise */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Core Expertise</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {expertise.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Connect</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {["LinkedIn", "Twitter", "Instagram", "Website"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                alex@conversion.studio
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Based in NY, Global Reach
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
};

export default AboutUs;
