import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do you help brands grow online?",
    a: "I focus on building scalable growth systems, not just running ads. This includes audience research, creative strategy, campaign optimization, and funnel improvements to ensure your brand grows consistently and sustainably.",
  },
  {
    q: "What makes your approach different?",
    a: "Most marketers focus only on running ads. My approach focuses on growth strategy, creative testing, and performance optimization together to build campaigns that are designed to scale.",
  },
];

const FAQSection = () => {
  return (
    <section id="faqs" className="px-6 py-20">
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
