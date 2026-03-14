import { useState, useEffect, useCallback, useRef } from "react";
import galleryData from "@/assests/events.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Event {
  id: number;
  category: string;
  categorySub: string;
  tag: string;
  tagSub: string;
  subtitle: string;
  title: string;
  titleEn: string;
  director: string;
  meta: string;
  lang: string;
  image: string;
  imageFallback: string;
}

interface GalleryData {
  meta: {
    festivalName: string;
    autoplayMs: number;
  };
  events: Event[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const { meta: festivalMeta, events } = galleryData as GalleryData;

// Resolve image — uses local path if available, falls back to URL
function resolveImage(event: Event): string {
  return event.image || event.imageFallback;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventGallery() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [show, setShow] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = events.length;
  const AUTOPLAY_MS = festivalMeta.autoplayMs;

  const goTo = useCallback(
    (index: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setShow(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      setTimeout(() => {
        setCurrent(index);
        setShow(true);
        setProgressKey((k) => k + 1);
        setTimeout(() => setTransitioning(false), 500);
      }, 320);
    },
    [transitioning]
  );

  const next = useCallback(
    () => goTo((current + 1) % total),
    [current, total, goTo]
  );
  const prev = useCallback(
    () => goTo((current - 1 + total) % total),
    [current, total, goTo]
  );

  // Auto-slide
  useEffect(() => {
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, next, AUTOPLAY_MS]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Derived slide references
  const e = events[current];
  const prevE = events[(current - 1 + total) % total];
  const nextE = events[(current + 1) % total];

  // Transition class helpers
  const contentCls = show
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-3";
  const imgCls = show
    ? "opacity-100 scale-100"
    : "opacity-0 scale-[1.04]";
  const sideCls = show ? "opacity-100" : "opacity-0";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Bebas+Neue&display=swap');

        .jiff-root    { font-family: 'Noto Sans KR', sans-serif; }
        .jiff-display { font-family: 'Bebas Neue', sans-serif; }

        .jiff-side-img {
          filter: grayscale(65%) brightness(0.55);
          transition: filter 0.5s ease, transform 0.6s ease;
        }
        .jiff-side-wrap:hover .jiff-side-img {
          filter: grayscale(15%) brightness(0.82);
          transform: scale(1.05);
        }

        @keyframes jiffProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .jiff-progress {
          animation: jiffProgress ${AUTOPLAY_MS}ms linear forwards;
          transform-origin: left;
        }

        .jiff-trans-img     { transition: opacity 0.45s ease, transform 0.5s ease; }
        .jiff-trans-content { transition: opacity 0.35s ease, transform 0.38s ease; }
        .jiff-trans-side    { transition: opacity 0.38s ease; }
        
        .jiff-root img {
          -webkit-user-drag: none;
            user-select: none;
            pointer-events: none;
          }
          .jiff-root .jiff-side-wrap,
          .jiff-root [role="button"] {
            pointer-events: all;
          }
          .jiff-bottom-info h2,
          .jiff-bottom-info p {
            text-shadow: 0 1px 8px rgba(0,0,0,0.85), 0 2px 24px rgba(0,0,0,0.6);
          }

      `}</style>

      <section className="jiff-root bg-[#0c0c0c] text-white w-full overflow-hidden">

        {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
        <nav className="flex items-center justify-between px-5 sm:px-8 lg:px-14 py-3.5 border-b border-white/[0.06]">
          <div className="flex gap-4 sm:gap-7">
            {(["Communities"] as const).map((label, i) => (
              <a
                key={label}
                href="#"
                className={`text-[10px] sm:text-[11px] tracking-[0.2em] uppercase transition-colors ${i === 3
                    ? "text-[#ff5c35] underline underline-offset-4 decoration-[#ff5c35]/40"
                    : "text-white/38 hover:text-white/75"
                  }`}
              >
                {label}
              </a>
            ))}
          </div>

          <span className="jiff-display text-[20px] sm:text-[24px] tracking-[0.4em] text-[#ff5c35]">
            {festivalMeta.festivalName}
          </span>

          <div className="flex gap-4 sm:gap-7">
            {["2024/26"].map((label) => (
              <a
                key={label}
                href="#"
                className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-white/38 hover:text-white/75 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        {/* ── GALLERY STRIP ──────────────────────────────────────────────── */}
        <div className="flex w-full" style={{ height: "clamp(300px, 50vw, 500px)" }}>

          {/* LEFT — previous slide */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`Go to previous: ${prevE.titleEn}`}
            onClick={prev}
            onKeyDown={(e) => e.key === "Enter" && prev()}
            className="hidden sm:block relative overflow-hidden shrink-0 cursor-pointer jiff-side-wrap border-r border-white/[0.07]"
            style={{ width: "clamp(62px, 7vw, 100px)" }}
          >
            <img
              draggable="false"
              src={resolveImage(prevE)}
              alt={prevE.titleEn}
              onError={(ev) => {
                (ev.target as HTMLImageElement).src = prevE.imageFallback;
              }}
              className={`jiff-side-img jiff-trans-side jiff-trans-img absolute inset-0 w-full h-full object-cover object-center ${sideCls}`}
            />

            {/* Orange category tag */}
            <div className="absolute top-0 inset-x-0 z-10 bg-[#ff5c35] px-1.5 py-1.5">
              <p className="text-[8.5px] font-bold text-black leading-tight truncate">
                {prevE.category}
              </p>
              <p className="text-[7.5px] text-black/55 leading-tight truncate">
                {prevE.categorySub}
              </p>
            </div>

            {/* Rotated label */}
            <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-3 flex justify-center">
              <span
                className="text-[7.5px] tracking-[0.25em] text-white/45 uppercase"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {prevE.categorySub}
              </span>
            </div>

            {/* Accent bar */}
            <div className="absolute bottom-0 right-0 w-[2px] h-14 bg-[#ff5c35] z-10" />
          </div>

          {/* CENTER — current slide */}
          <div className="relative flex-1 overflow-hidden">
            <img
              draggable="false"
              src={resolveImage(e)}
              alt={e.titleEn}
              onError={(ev) => {
                (ev.target as HTMLImageElement).src = e.imageFallback;
              }}
              className={`jiff-trans-img absolute inset-0 w-full h-full object-cover object-center ${imgCls}`}
            />

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/20 to-black/5 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/30 pointer-events-none" />

            {/* Top-left tag */}
            <div className={`absolute top-0 left-0 z-10 jiff-trans-content ${contentCls}`}>
              <div className="bg-[#ff5c35] px-3 py-2 min-w-[100px]">
                <p className="text-[11px] font-bold text-black leading-tight">{e.tag}</p>
                <p className="text-[9px] text-black/55 mt-0.5 leading-none">{e.tagSub}</p>
              </div>
            </div>

            {/* Bottom info */}
            <div
              className={`absolute bottom-0 left-0 right-0 z-10 px-5 sm:px-7 lg:px-9 pb-5 sm:pb-7 jiff-trans-content ${contentCls}`}
            >
              <p className="text-[10px] sm:text-[11px] text-[#ff5c35] tracking-[0.2em] uppercase font-medium mb-1">
                {e.subtitle}
              </p>
              <h2 className="text-[22px] sm:text-[30px] lg:text-[38px] font-bold leading-[1.1] mb-2">
                {e.title}
              </h2>
              <p className="text-[10px] sm:text-xs text-white/50 font-light mb-2.5 tracking-wide">
                {e.director}
              </p>
              <div className="inline-block bg-[#ff5c35] px-2.5 py-[5px]">
                <p className="text-[8px] sm:text-[9px] text-black font-bold tracking-wide">
                  {e.meta}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — next slide (split top / bottom) */}
          <div
            className="hidden md:flex flex-col shrink-0 border-l border-white/[0.07]"
            style={{ width: "clamp(110px, 13vw, 170px)" }}
          >
            {/* Top half */}
            <div
              role="button"
              tabIndex={0}
              aria-label={`Go to next: ${nextE.titleEn}`}
              onClick={next}
              onKeyDown={(ev) => ev.key === "Enter" && next()}
              className="h-1/2 relative overflow-hidden border-b border-white/[0.07] cursor-pointer jiff-side-wrap"
            >
              <img
                draggable="false"
                src={resolveImage(nextE)}
                alt={nextE.titleEn}
                onError={(ev) => {
                  (ev.target as HTMLImageElement).src = nextE.imageFallback;
                }}
                className={`jiff-side-img jiff-trans-side jiff-trans-img absolute inset-0 w-full h-full object-cover object-top ${sideCls}`}
              />
              <div className="absolute top-0 left-0 z-10 bg-[#ff5c35] px-2 py-1.5 max-w-full">
                <p className="text-[9px] font-bold text-black leading-tight truncate">
                  {nextE.tag}
                </p>
                <p className="text-[7.5px] text-black/55 leading-tight truncate">
                  {nextE.tagSub}
                </p>
              </div>
            </div>

            {/* Bottom half */}
            <div
              role="button"
              tabIndex={0}
              aria-label={`Go to next: ${nextE.titleEn}`}
              onClick={next}
              onKeyDown={(ev) => ev.key === "Enter" && next()}
              className="h-1/2 relative overflow-hidden cursor-pointer jiff-side-wrap"
            >
              <img
                draggable="false"
                src={resolveImage(nextE)}
                alt={nextE.titleEn}
                onError={(ev) => {
                  (ev.target as HTMLImageElement).src = nextE.imageFallback;
                }}
                className={`jiff-side-img jiff-trans-side jiff-trans-img absolute inset-0 w-full h-full object-cover object-bottom ${sideCls}`}
              />
              <div className="absolute top-0 left-0 z-10 bg-black/80 px-2 py-1.5 max-w-full">
                <p className="text-[9px] font-bold text-white leading-tight truncate">
                  {nextE.category}
                </p>
                <p className="text-[7.5px] text-white/45 leading-tight truncate">
                  {nextE.categorySub}
                </p>
              </div>
              <div className="absolute bottom-2.5 right-2 text-right z-10">
                <p
                  className="jiff-display leading-tight text-white/[0.16]"
                  style={{ fontSize: "clamp(11px, 1.1vw, 16px)", letterSpacing: "0.15em" }}
                >
                  FILM
                  <br />
                  FESTIVAL
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROGRESS BAR ───────────────────────────────────────────────── */}
        <div className="h-[2px] bg-white/[0.06] w-full">
          <div key={progressKey} className="h-full bg-[#ff5c35] jiff-progress w-full" />
        </div>

        {/* ── BOTTOM BAR ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-14 py-3">

          {/* ← prev info */}
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="flex items-center gap-2.5 group focus:outline-none min-w-0"
          >
            <span className="text-white/22 text-[20px] leading-none group-hover:text-[#ff5c35] transition-colors shrink-0">
              ‹
            </span>
            <span className="hidden sm:block text-left min-w-0">
              <p className="text-[10px] text-[#ff5c35] font-medium leading-tight truncate">
                {prevE.title}
              </p>
              <p className="text-[9px] text-white/28 leading-tight truncate">
                {prevE.titleEn}
              </p>
            </span>
          </button>

          {/* Counter + dots */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <span className="jiff-display text-[28px] sm:text-[34px] text-[#ff5c35] tracking-wide leading-none">
              {current + 1}
              <span className="text-white/20 text-[20px] sm:text-[24px]">/{total}</span>
            </span>
            <div className="flex items-center gap-1.5">
              {events.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 focus:outline-none ${i === current
                      ? "w-5 h-[4px] bg-[#ff5c35]"
                      : "w-[4px] h-[4px] bg-white/18 hover:bg-white/40"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* lang + → */}
          <button
            onClick={next}
            aria-label="Next slide"
            className="flex items-center gap-2.5 group focus:outline-none min-w-0"
          >
            <span className="hidden sm:block text-right min-w-0">
              <p className="text-[10px] text-[#ff5c35] font-medium leading-tight text-right">
                {e.lang}
              </p>
              <p className="text-[9px] text-white/28 leading-tight text-right">Language</p>
            </span>
            <span className="text-white/22 text-[20px] leading-none group-hover:text-[#ff5c35] transition-colors shrink-0">
              ›
            </span>
          </button>
        </div>
      </section>
    </>
  );
}