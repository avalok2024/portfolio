import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do you tailor Google Ads strategies for different businesses?",
    a: "We start with a deep audit of your business model, competition, and target audience. From there we build custom campaign structures, keyword strategies, and bidding models that align with your specific growth goals and margins.",
  },
  {
    q: "What's unique about your Meta Ads approach?",
    a: "We combine creative testing frameworks with advanced audience segmentation and real-time optimization. Our approach focuses on full-funnel strategy — from awareness through to conversion — using data-backed creative iteration.",
  },
];

const FAQSection = () => {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-2xl border border-border bg-card px-6"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
