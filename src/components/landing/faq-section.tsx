import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "@/content/copy/faq";
import { NotebookSection } from "./notebook-section";

export function FaqSection() {
  return (
    <NotebookSection id="faq" labelledBy="faq-title">
      <h2 id="faq-title" className="font-serif text-7xl font-black">
        <span className="text-gold-800">Q</span>
        <span className="text-navy-900">&amp;</span>
        <span className="text-blue-700">A</span>
        <span className="sr-only">: frequently asked questions</span>
      </h2>
      <Accordion type="multiple" className="mt-8 grid gap-3 lg:grid-cols-2 lg:items-start">
        {FAQ.map(({ question, answer }, i) => (
          <AccordionItem
            key={question}
            value={`q${i}`}
            className={`${i % 4 === 0 || i % 4 === 3 ? "bg-blue-100" : "bg-area-financial"} rounded-card border-0 px-5`}
          >
            <AccordionTrigger className="text-navy-900 gap-4 py-5 text-left font-serif text-lg font-bold hover:no-underline">
              <span className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className={`${i % 4 === 0 || i % 4 === 3 ? "text-blue-700" : "text-gold-800"} font-serif text-4xl leading-none font-normal`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {question}
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-body text-ink-900 pb-5 pl-14">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </NotebookSection>
  );
}
