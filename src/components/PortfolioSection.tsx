import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";

import poster12 from "@/assests/poster/poster12.webp";
import poster2 from "@/assests/poster/poster2.webp";
import poster3 from "@/assests/poster/poster3.webp";
import poster4 from "@/assests/poster/poster4.webp";
import poster5 from "@/assests/poster/poster5.webp";
import poster6 from "@/assests/poster/poster6.webp";
import poster7 from "@/assests/poster/poster7.webp";
import poster8 from "@/assests/poster/poster8.webp";
import poster9 from "@/assests/poster/poster9.webp";
import poster10 from "@/assests/poster/poster10.webp";
import poster11 from "@/assests/poster/poster11.webp";
import poster1 from "@/assests/poster/poster1.webp";
import poster13 from "@/assests/poster/poster13.webp";
import poster14 from "@/assests/poster/poster14.webp";
import poster15 from "@/assests/poster/poster15.webp";

const images = [
  { src: poster12, link: "https://luma.com/7jo1otl0", label: "P2P Keyholders Hour : Bengaluru", description: "IBW (India Blockchain Week) for a raw, no-fluff Cypherpunk 2.0 meetup." },
  { src: poster2, link: "#", label: "Creators Talk", description: "How To Create Content That Grab Attention" },
  { src: poster3, link: "https://x.com/MehtabAnsari_/status/2025167509109002639?s=20", label: "Own The Flow - Video Competion", description: "Creative for a high-impact product launch." },
  { src: poster4, link: "https://x.com/P2Pdotme/status/1990435088153374801", label: "P2P.me Cashback Campaign", description: "BTC as cash-back everytime you pay with ScanPay" },
  { src: poster5, link: "https://x.com/P2Pdotme/status/1983186098949181800", label: "$22,500 Montly Rewards", description: "P2P Rewards Program with Monthly Incentives for Users and Merchants" },
  { src: poster6, link: "https://x.com/P2Pdotme/status/1976175707731509496?s=20", label: "Start Earning as a P2P Merchant", description: "Earn passive income by facilitating seamless on-ramp and off-ramp transactions while helping the network grow." },
  { src: poster7, link: "https://x.com/p2pdotfound/status/2000906257088102790?s=20", label: "Global Ambassador Program", description: "Introducing the P2P Foundation Global Ambassador Program" },
  { src: poster8, link: "https://luma.com/p2pfoundation", label: "P2P Foundation Workshop - India", description: "Bringing Web3 education to beginners in colleges and universities across India" },
  { src: poster9, link: "https://x.com/p2pdotfound/status/2001269492199121164?s=20", label: "Touch The Grass", description: "Wayanda trip with Content Creators" },
  { src: poster10, link: "https://luma.com/k6i0fjjx", label: "P2P.me Movie Night – Final Edition | Delhi", description: "devs and degens to founders and community leads across Delhi-NCR" },
  { src: poster1, link: "https://luma.com/lh5skjdd", label: "House Partyy with P2P.me", description: "Eth Global Delhi, join us for an exclusive House Partyy sponsored by P2P.me" },
  { src: poster11, link: "https://luma.com/j5kmr24l", label: "Cryptoholic x MagicCraft: Game Night", description: "Optimized for engagement." },
  { src: poster13, link: "https://x.com/Cryptoholic_Soc/status/1887224018799108328?s=20", label: "Become a Core Innovator", description: "Join a community of builders shaping the future of Web3." },
  { src: poster14, link: "https://x.com/P2Pdotme/status/1905149644612722889?s=20", label: "P2P Indian Ambassador Program", description: "P2P.me platform and help expand a global community" },
  { src: poster15, link: "https://www.linkedin.com/posts/avalok_on-the-occasion-of-world-consumer-rights-ugcPost-7439604679531089920-dQ0a", label: "Worlds Consumers Rights Day", description: "Workshop organized by the Bureau of Indian Standards at Shyam Lal College (University of Delhi) " },
];

const PortfolioSection = () => {

  const [showAll, setShowAll] = useState(false);

  const gridRef = useRef<HTMLDivElement | null>(null);

  const handleToggle = () => {
    setShowAll((prev) => !prev);

    setTimeout(() => {
      gridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 200);
  };

  return (
    <section className="px-6 py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 rounded-full border-border bg-secondary text-muted-foreground">
            My Work
          </Badge>

          <h2 className="text-3xl font-extrabold text-foreground md:text-5xl">
            Creative{" "}
            <em style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              Excellence
            </em>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            A selection of our high-performing creative work across multiple social platforms as well as offline events.
          </p>
        </div>

        {/* Masonry Grid */}
        <div
          ref={gridRef}
          className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
        >
          {images.map((item, i) => {

            const hidden = !showAll && i >= 8;

            return (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ animationDelay: `${i * 80}ms` }}
                className={`group relative block break-inside-avoid overflow-hidden rounded-2xl transition-all duration-500 ${
                  hidden ? "hidden" : "animate-fadeUp"
                }`}
              >

                <img
                  src={item.src}
                  alt={item.label}
                  draggable={false}
                  className="w-full h-auto object-cover select-none transition-transform duration-500 ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 transition duration-300 group-hover:opacity-100">
                  <h3 className="text-sm font-semibold">
                    {item.label}
                  </h3>

                  <p className="mt-1 text-xs text-white/80">
                    {item.description}
                  </p>
                </div>

              </a>
            );

          })}
        </div>

        {/* View More Section */}
        <div className="relative mt-8">

          {!showAll && (
            <div className="pointer-events-none absolute inset-x-0 -top-40 h-40 bg-gradient-to-t from-background via-background/90 to-transparent z-10" />
          )}

          {images.length > 8 && (
            <div className="relative z-20 flex justify-center pt-12">

              <button
                onClick={handleToggle}
                className="rounded-full border border-border bg-background/60 backdrop-blur px-8 py-3 text-sm font-semibold text-foreground shadow-xl transition-all duration-300 hover:bg-secondary hover:scale-105 active:scale-95"
              >
                {showAll ? "Show Less" : "View More"}
              </button>

            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default PortfolioSection;