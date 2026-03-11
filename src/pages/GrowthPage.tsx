"use client";

import { useEffect, useRef, useState } from "react";
import {
  TrendingUp,
  BarChart2,
  Activity,
  Target,
  Search,
  LayoutTemplate,
  Megaphone,
  MailPlus,
  ArrowUpRight,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";

// ─── Static Data ──────────────────────────────────────────────────────────────

const heroMetrics = [
  {
    label: "Current monthly revenue",
    value: "$186k",
    note: "Up from $72k in January",
  },
  {
    label: "Blended ROAS",
    value: "4.8x",
    note: "Creative + retention working together",
  },
  {
    label: "Lead to purchase rate",
    value: "18.2%",
    note: "Highest conversion month so far",
  },
];

const recentUpdateRows = [
  { label: "Main action", value: "Landing page relaunch" },
  { label: "Best channel", value: "Meta acquisition" },
  { label: "Latest impact", value: "+31% week-over-week revenue" },
];

const snapshotStats = [
  { label: "New customer revenue", value: "$124k", note: "66% of current month total" },
  { label: "Returning customer revenue", value: "$62k", note: "Email and SMS lifting margin" },
  { label: "AOV trend", value: "+$14", note: "Bundle strategy performing well" },
  { label: "Creative win rate", value: "42%", note: "Out of 19 new concepts tested" },
];

const barData = [
  { label: "Jan", primary: 66, secondary: 50 },
  { label: "Feb", primary: 84, secondary: 58 },
  { label: "Mar", primary: 112, secondary: 74 },
  { label: "Apr", primary: 128, secondary: 86 },
  { label: "May", primary: 144, secondary: 102 },
  { label: "Jun", primary: 162, secondary: 116 },
  { label: "Jul", primary: 176, secondary: 128 },
  { label: "Aug", primary: 188, secondary: 142 },
];

const insights = [
  {
    icon: LayoutTemplate,
    title: "Landing page rebuild",
    description: "Sharper messaging, cleaner offer stack, and trust proof above the fold.",
    impact: "+22%",
  },
  {
    icon: Megaphone,
    title: "Creative testing sprint",
    description: "UGC, product comparison, and problem-solution ads tested across audiences.",
    impact: "+31%",
  },
  {
    icon: MailPlus,
    title: "Retention flows",
    description: "Post-purchase, browse abandonment, and win-back flows improved repeat revenue.",
    impact: "+18%",
  },
  {
    icon: Target,
    title: "Offer positioning refresh",
    description: "Margin-safe bundles and a stronger first-order incentive increased AOV.",
    impact: "+14%",
  },
  {
    icon: Search,
    title: "Weekly diagnosis loop",
    description: "Every week we reviewed funnel leaks and made one focused improvement.",
    impact: "Stable",
  },
];

const growthHealth = [
  { label: "Paid social CPA", value: "$24", note: "Down from $37 before the rebuild." },
  { label: "Conversion rate", value: "4.3%", note: "New landing pages are converting better." },
  { label: "Repeat purchase share", value: "27%", note: "Retention flows now add consistent margin." },
  { label: "Creative pipeline", value: "12 live", note: "Fresh concepts ready to prevent fatigue." },
];

const revenueRows = [
  { month: "Jan", revenue: "$72k", change: "Baseline", progress: 38 },
  { month: "Feb", revenue: "$84k", change: "+16.7%", progress: 45 },
  { month: "Mar", revenue: "$101k", change: "+20.2%", progress: 54 },
  { month: "Apr", revenue: "$118k", change: "+16.8%", progress: 63 },
  { month: "May", revenue: "$136k", change: "+15.3%", progress: 73 },
  { month: "Jun", revenue: "$152k", change: "+11.7%", progress: 82 },
  { month: "Jul", revenue: "$168k", change: "+10.5%", progress: 90 },
  { month: "Aug", revenue: "$186k", change: "+10.7%", progress: 100 },
];

const timelineItems = [
  {
    month: "January",
    phase: "Foundation",
    revenue: "$72k",
    description:
      "Audited the account, mapped funnel leaks, restructured campaign naming, and established clean tracking for paid + retention attribution.",
    note: "Add campaign audit, setup screenshots, or launch posters here.",
    images: [
      "https://storage.googleapis.com/banani-generated-images/generated-images/1266cb00-0ee3-4b60-9af4-39d1d15a5bc6.jpg",
      "https://storage.googleapis.com/banani-generated-images/generated-images/519b349b-419e-45c7-a343-916c86759b46.jpg",
    ],
  },
  {
    month: "February",
    phase: "Offer clarity",
    revenue: "$84k",
    description:
      "Repositioned the hero offer, improved PDP storytelling, and introduced a new landing page with stronger conversion framing.",
    note: "Use this row for product story posters and landing page updates.",
    images: [
      "https://storage.googleapis.com/banani-generated-images/generated-images/7d06bb29-2ec1-473e-90a7-fa23f11d1b50.jpg",
      "https://storage.googleapis.com/banani-generated-images/generated-images/c4a2fb04-01ed-4f8f-8fcd-b3f8fadd366f.jpg",
    ],
  },
  {
    month: "March",
    phase: "Creative iteration",
    revenue: "$101k",
    description:
      "Launched a creative sprint focused on hooks, testimonials, and competitive alternatives to improve CTR and lower CPA.",
    note: "Great for ad creatives, hook variants, and winning poster visuals.",
    images: [
      "https://storage.googleapis.com/banani-generated-images/generated-images/47bbf3f9-c902-4d07-86b1-b81fd788f1b8.jpg",
      "https://storage.googleapis.com/banani-generated-images/generated-images/a84b4a06-0d78-464e-905c-9de1b8d2502e.jpg",
    ],
  },
  {
    month: "April",
    phase: "Scale phase",
    revenue: "$118k",
    description:
      "Expanded winning audiences, added broad targeting, and built a retargeting ladder tied to new customer acquisition campaigns.",
    note: "Drop scale phase campaign posters and audience expansion updates here.",
    images: [
      "https://storage.googleapis.com/banani-generated-images/generated-images/0cf593ad-af22-4d95-a8f4-bf944e77f6df.jpg",
      "https://storage.googleapis.com/banani-generated-images/generated-images/0c6268b5-dfd1-4a95-bcd6-a878e198bce3.jpg",
    ],
  },
  {
    month: "May",
    phase: "Retention support",
    revenue: "$136k",
    description:
      "Email and SMS flows were refreshed to capture more revenue after the first purchase and support stronger blended results.",
    note: "Ideal for retention flow posters, event messages, and CRM visuals.",
    images: [
      "https://storage.googleapis.com/banani-generated-images/generated-images/2706e0aa-4c44-4be1-b16b-192dfaad32da.jpg",
      "https://storage.googleapis.com/banani-generated-images/generated-images/2706e0aa-4c44-4be1-b16b-192dfaad32da.jpg",
    ],
  },
  {
    month: "June–August",
    phase: "Momentum",
    revenue: "$186k",
    description:
      "Weekly optimization across creative, landing pages, and budget movement kept scaling stable while protecting contribution margin.",
    note: "Use for monthly winners, updates, event posters, and recent campaign launches.",
    images: [
      "https://storage.googleapis.com/banani-generated-images/generated-images/c8220bb0-3fc5-42a6-bfdb-4b63735ac737.jpg",
      "https://storage.googleapis.com/banani-generated-images/generated-images/34e4ae76-a25f-47d6-a713-9cea32d36403.jpg",
    ],
  },
];

const posterImages = [
  "https://storage.googleapis.com/banani-generated-images/generated-images/57c5586b-b3b6-4673-a5ec-75b772167a12.jpg",
  "https://storage.googleapis.com/banani-generated-images/generated-images/41e28ded-a9cf-41ac-8b90-17f3db166e71.jpg",
  "https://storage.googleapis.com/banani-generated-images/generated-images/2639105f-c4f8-4061-9345-b87db648027f.jpg",
];

// ─── Custom Hook ──────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ─── Reusable Sub-components ──────────────────────────────────────────────────

const AnimatedBar = ({
  bar,
  index,
}: {
  bar: { label: string; primary: number; secondary: number };
  index: number;
}) => {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className="flex-1 min-w-0 flex flex-col items-center justify-end gap-2">
      <div className="w-full flex items-end justify-center gap-1 h-[188px]">
        <div
          className="w-3 sm:w-4 rounded-full bg-muted-foreground/20 transition-all duration-700 ease-out"
          style={{ height: inView ? `${bar.secondary}px` : "0px", transitionDelay: `${index * 60}ms` }}
        />
        <div
          className="w-3 sm:w-4 rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ height: inView ? `${bar.primary}px` : "0px", transitionDelay: `${index * 60 + 80}ms` }}
        />
      </div>
      <span className="text-[11px] sm:text-[12px] text-muted-foreground whitespace-nowrap">
        {bar.label}
      </span>
    </div>
  );
};

const AnimatedProgressBar = ({ progress, delay = 0 }: { progress: number; delay?: number }) => {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="h-1.5 rounded-full bg-border overflow-hidden flex-1">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-1000 ease-out"
        style={{ width: inView ? `${progress}%` : "0%", transitionDelay: `${delay}ms` }}
      />
    </div>
  );
};

const TimelineEntry = ({
  item,
  index,
  isLast,
}: {
  item: typeof timelineItems[number];
  index: number;
  isLast: boolean;
}) => {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className="grid grid-cols-[24px_1fr] gap-3 items-start transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <div className="relative flex justify-center flex-shrink-0 mt-1.5">
        <div className="w-3 h-3 rounded-full bg-primary z-10 relative" />
        {!isLast && <div className="absolute top-3.5 bottom-[-36px] w-px bg-border" />}
      </div>
      <div className="rounded-xl border border-border bg-background p-4 hover:border-primary/30 transition-colors duration-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-sm font-medium text-foreground">
            {item.month} · {item.phase}
          </span>
          <span className="text-xs font-semibold text-primary">{item.revenue}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{item.description}</p>
        <div className="grid grid-cols-[56px_56px_1fr] gap-2 items-stretch">
          {item.images.map((src, i) => (
            <div key={i} className="w-14 h-[72px] rounded-lg overflow-hidden bg-secondary flex-shrink-0">
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
          <div className="flex items-center px-2.5 py-2 rounded-lg bg-secondary/50 border border-border text-[11px] leading-snug text-muted-foreground">
            {item.note}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Page Component ───────────────────────────────────────────────────────────

const GrowthPage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="text-center py-16 px-4">
        <span className="inline-block rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground mb-6">
          Growth Dashboard
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          A growth page that shows{" "}
          <span className="font-serif italic font-normal">what we did</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          When we did it, and how revenue moved every month — built for client
          reporting, founder updates, and investor-ready snapshots.
        </p>
      </section>

      {/* Hero grid — metrics + side cards */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div
          className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.85fr] gap-6 items-stretch transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)" }}
        >
          {/* Left */}
          <div className="flex flex-col gap-6 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Performance timeline for current clients
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-xl">
              This page blends current company performance, recent wins, campaign
              actions, and monthly revenue changes in one clean view.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-200">
                Open latest company report
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
                View all monthly timelines
              </button>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {heroMetrics.map((m, i) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-border bg-secondary/50 p-4 hover:-translate-y-1 hover:border-primary/30 transition-all duration-300"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms, box-shadow 0.2s ease, border-color 0.2s ease`,
                  }}
                >
                  <p className="text-xs text-muted-foreground mb-3 truncate">{m.label}</p>
                  <p className="text-3xl font-bold tracking-tight mb-1">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side cards */}
          <div
            className="flex flex-col gap-4"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.7s ease 200ms, transform 0.7s ease 200ms",
            }}
          >
            {/* Recent update */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary/50 p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />
              <div className="relative flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Recent update</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Live this week
                </span>
              </div>
              <h2 className="relative text-xl font-bold mb-2">
                Current growth status for Nova Commerce
              </h2>
              <p className="relative text-sm text-muted-foreground mb-4 leading-relaxed">
                We launched three creative angles, rebuilt the landing page narrative,
                and refreshed retargeting sequences.
              </p>
              <div className="relative flex flex-col gap-2">
                {recentUpdateRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-background/60 border border-border"
                  >
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <strong className="text-xs font-medium text-foreground">{row.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Snapshot */}
            <div className="rounded-2xl border border-border bg-secondary/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Current company snapshot
                </span>
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {snapshotStats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-border bg-background p-3 hover:border-primary/30 transition-colors duration-200"
                  >
                    <p className="text-[11px] text-muted-foreground mb-2 truncate">{s.label}</p>
                    <p className="text-xl font-bold tracking-tight mb-1">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground">{s.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard — Chart + Insights */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.95fr] gap-6 items-start">

          {/* Revenue chart */}
          <div className="rounded-2xl border border-border bg-secondary/30 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-1">Monthly revenue change</h2>
                <p className="text-sm text-muted-foreground">
                  Track each month against the previous baseline.
                </p>
              </div>
              <span className="inline-block rounded-full border border-border px-3 py-1 text-xs text-muted-foreground whitespace-nowrap self-start">
                Jan to Aug performance
              </span>
            </div>

            <div className="rounded-xl border border-border bg-background/40 p-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
                <div>
                  <p className="text-3xl font-bold tracking-tight mb-1">$186,000</p>
                  <p className="text-xs text-muted-foreground">
                    Current month revenue · +158% since the first month
                  </p>
                </div>
                <span className="inline-block rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                  Revenue vs baseline
                </span>
              </div>

              <div className="relative h-[248px]">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {["$200k", "$150k", "$100k", "$50k", "$0"].map((label) => (
                    <div key={label} className="relative border-t border-border/50">
                      <span className="absolute left-0 -top-2.5 text-[10px] text-muted-foreground bg-background/40 pr-2 whitespace-nowrap">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute left-10 right-2 top-3 bottom-3 flex items-end justify-between gap-1.5 sm:gap-3">
                  {barData.map((bar, i) => (
                    <AnimatedBar key={bar.label} bar={bar} index={i} />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { cls: "bg-muted-foreground/30", label: "Previous month baseline" },
                  { cls: "bg-primary", label: "Revenue after new actions" },
                ].map(({ cls, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cls}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What we changed */}
          <div className="rounded-2xl border border-border bg-secondary/30 p-6">
            <h2 className="text-xl font-bold tracking-tight mb-1">What we changed</h2>
            <p className="text-sm text-muted-foreground mb-5">
              The key work that pushed growth forward.
            </p>
            <div className="flex flex-col gap-3">
              {insights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="grid grid-cols-[auto_1fr_auto] gap-3 items-center p-3.5 rounded-xl border border-border bg-background hover:border-primary/30 hover:translate-x-1 transition-all duration-200 cursor-default"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-sm font-medium text-foreground mb-0.5">
                        {item.title}
                      </strong>
                      <span className="block text-xs text-muted-foreground leading-snug">
                        {item.description}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-primary whitespace-nowrap">
                      {item.impact}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="container mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-block rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground mb-4">
              Client Growth Timeline
            </span>
            <h2 className="text-3xl font-bold tracking-tight">
              Month by month actions and{" "}
              <span className="font-serif italic font-normal">revenue lifts</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-md lg:text-right leading-relaxed">
            The monthly strategy, campaign changes, and the direct growth result
            in a single timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.45fr] gap-6 items-start">

          {/* Execution timeline */}
          <div className="rounded-2xl border border-border bg-secondary/30 p-6">
            <h3 className="text-xl font-bold tracking-tight mb-1">Execution timeline</h3>
            <p className="text-sm text-muted-foreground mb-6">
              What we did each month to move growth forward.
            </p>
            <div className="flex flex-col gap-5 pl-2">
              {timelineItems.map((item, i) => (
                <TimelineEntry
                  key={item.month}
                  item={item}
                  index={i}
                  isLast={i === timelineItems.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">

            {/* Growth health */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-6">
              <h3 className="text-xl font-bold tracking-tight mb-1">Current growth health</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Quick view of the company right now.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {growthHealth.map((g) => (
                  <div
                    key={g.label}
                    className="rounded-xl border border-border bg-background p-4 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <p className="text-xs text-muted-foreground mb-3 whitespace-nowrap">{g.label}</p>
                    <p className="text-2xl font-bold tracking-tight mb-1.5">{g.value}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{g.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue table */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-6">
              <h3 className="text-xl font-bold tracking-tight mb-1">Monthly revenue table</h3>
              <p className="text-sm text-muted-foreground mb-5">
                A clean row-by-row view for reporting meetings.
              </p>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[60px_1fr_72px_84px] gap-3 items-center pb-2 px-1">
                  {["Month", "Progress", "Revenue", "Change"].map((h) => (
                    <span key={h} className="text-xs text-muted-foreground">{h}</span>
                  ))}
                </div>
                {revenueRows.map((row, i) => (
                  <div
                    key={row.month}
                    className="grid grid-cols-[60px_1fr_72px_84px] gap-3 items-center px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-secondary/50 transition-colors duration-200"
                  >
                    <strong className="text-sm font-medium text-foreground">{row.month}</strong>
                    <AnimatedProgressBar progress={row.progress} delay={i * 60} />
                    <span className="text-sm text-foreground">{row.revenue}</span>
                    <span
                      className={`text-xs font-medium ${
                        row.change === "Baseline" ? "text-muted-foreground" : "text-primary"
                      }`}
                    >
                      {row.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Poster gallery */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-6">
              <h3 className="text-xl font-bold tracking-tight mb-1">Campaign poster gallery</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Creative frames you can connect to each milestone or growth push.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {posterImages.map((src, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden bg-secondary aspect-[3/4] border border-border hover:scale-[1.03] hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <img
                      src={src}
                      alt={`Campaign poster ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                ))}
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

export default GrowthPage;