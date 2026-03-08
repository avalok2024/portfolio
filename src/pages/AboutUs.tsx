import { CheckCircle, Award, Zap, Link as LinkIcon, Mail, MapPin } from "lucide-react";
import founderImg from "@/assests/founder.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";

const highlights = [
  "Growth & marketing contributor for P2P.me, P2P Foundation, and Coins.me",
  "Scaling Web3 communities through strategic campaigns and partnerships",
  "Leading ambassador programs and creator-driven growth initiatives",
  "Focused on driving adoption of decentralized financial infrastructure"
];

const socials = [
  { name: "LinkedIn", url: "https://linkedin.com/in/avalok" },
  { name: "Twitter", url: "https://twitter.com/avalok2023" },
  { name: "Instagram", url: "https://instagram.com/0xavalok" },
  { name: "Discord", url: "https://discord.gg/0xavalok" },
];

const expertise = [
  "Artificial Intelligence",
  "Deep Learning & Neural Networks",
  "Computer Vision",
  "Mathematical Modeling",
  "Web3 Ecosystem Growth",
  "Data Science",
  "AI Research",
  "Product Strategy"
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
          The minds driving the success of P2Pdotme
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
              With over a year of experience in paid media and growth strategy, I founded
               to bridge the gap between creative excellence and data-driven
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
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {s.name}
                </a>
              ))}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                avalok2023@gmail.com
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Based in New Delhi, Global Reach
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
