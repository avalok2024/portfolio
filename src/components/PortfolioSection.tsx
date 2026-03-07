import { useState } from "react";
import { Badge } from "@/components/ui/badge";

import poster1 from "@/assests/poster/poster1.png";
import poster2 from "@/assests/poster/poster2.jpg";
import poster3 from "@/assests/poster/poster3.png";
import poster4 from "@/assests/poster/poster4.png";
import poster5 from "@/assests/poster/poster5.png";
import poster6 from "@/assests/poster/poster6.png";
import poster7 from "@/assests/poster/poster7.png";
import poster8 from "@/assests/poster/poster8.png";
import poster9 from "@/assests/poster/poster9.png";
import poster10 from "@/assests/poster/poster10.png";
import poster11 from "@/assests/poster/poster11.png";
import poster12 from "@/assests/poster/poster12.png";
import poster13 from "@/assests/poster/poster13.png";

const images = [
  { src: poster1, link: "#", label: "Meta Ads Campaign", description: "High-performing Meta ad focused on conversions." },
  { src: poster2, link: "#", label: "Brand Awareness", description: "Campaign designed to reach new audiences." },
  { src: poster3, link: "#", label: "Product Launch", description: "Creative for a high-impact product launch." },
  { src: poster4, link: "#", label: "Retargeting Ads", description: "Ad designed for returning customers." },
  { src: poster5, link: "#", label: "Performance Creative", description: "Optimized creative built for engagement." },
  { src: poster6, link: "#", label: "Social Campaign", description: "Multi-platform social advertising campaign." },
  { src: poster7, link: "#", label: "Growth Marketing", description: "Ad creative focused on scaling growth." },
  { src: poster8, link: "#", label: "Conversion Ad", description: "Creative optimized for higher sales." },
  // { src: poster9, link: "#", label: "Creative Campaign", description: "High impact marketing creative." },
  // { src: poster10, link: "#", label: "Product Marketing", description: "Conversion focused ad design." },
  // { src: poster11, link: "#", label: "Ad Creative", description: "Optimized for engagement." },
  // { src: poster12, link: "#", label: "Growth Campaign", description: "Built for scalable marketing." },
  // { src: poster13, link: "#", label: "Brand Creative", description: "Premium brand marketing design." }
];

const PortfolioSection = () => {

  const [showAll, setShowAll] = useState(false);

  const visibleImages = showAll ? images : images.slice(0, 8);

  return (
    <section className="px-6 py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl">

        <div className="mb-12 text-center">
          <Badge className="mb-4 rounded-full border-border bg-secondary text-muted-foreground hover:bg-secondary">
            My Work
          </Badge>

          <h2 className="text-3xl font-extrabold text-foreground md:text-5xl">
            Creative{" "}
            <em style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              Excellence
            </em>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            A selection of our high-performing creative work across multiple social platforms.
          </p>
        </div>

        {/* Collage Layout */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">

          {visibleImages.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              onContextMenu={(e) => e.preventDefault()}
              className="group relative block break-inside-avoid overflow-hidden rounded-2xl"
            >

              <img
                src={item.src}
                alt={item.label}
                draggable={false}
                className="w-full h-auto object-cover select-none transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

              <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition duration-300">

                <h3 className="text-sm font-semibold">
                  {item.label}
                </h3>

                <p className="mt-1 text-xs text-white/80">
                  {item.description}
                </p>

              </div>

            </a>
          ))}

        </div>

        {/* View More Button */}
        {images.length > 8 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="rounded-full border border-border px-8 py-3 text-sm font-semibold transition hover:bg-secondary"
            >
              {showAll ? "Show Less" : "View More"}
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default PortfolioSection;