"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const PATHWAYS = [
  ["hired", "Hired", "I already have a job."],
  ["job_search", "Job Search", "I'm looking for work."],
  ["higher_ed", "Higher Education", "I'm continuing my education."],
] as const;

export function FormDemo() {
  const [city, setCity] = useState("");
  const invalid = city.length > 0 && city.length < 3;

  return (
    <form className="flex max-w-md flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      <Field data-invalid={invalid || undefined}>
        <FieldLabel htmlFor="kit-city">Target city</FieldLabel>
        <Input
          id="kit-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby="kit-city-help"
          placeholder="Atlanta, GA"
        />
        <FieldDescription id="kit-city-help">
          Type fewer than 3 letters to see an error.
        </FieldDescription>
        {invalid && <FieldError>Enter at least 3 characters.</FieldError>}
      </Field>

      <FieldSet>
        <FieldLegend>Where are you headed?</FieldLegend>
        <RadioGroup defaultValue="hired" className="gap-3">
          {PATHWAYS.map(([value, label, description]) => (
            <Field key={value} orientation="horizontal">
              <RadioGroupItem value={value} id={`kit-${value}`} />
              <FieldLabel htmlFor={`kit-${value}`} className="flex flex-col items-start gap-0">
                <span>{label}</span>
                <span className="text-ink-600 font-normal">{description}</span>
              </FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      </FieldSet>

      <Field orientation="horizontal">
        <Checkbox id="kit-first-gen" defaultChecked />
        <FieldLabel htmlFor="kit-first-gen">First-Generation</FieldLabel>
      </Field>

      <Field orientation="horizontal">
        <Switch id="kit-share" />
        <FieldLabel htmlFor="kit-share">Share outputs with my mentors</FieldLabel>
      </Field>

      <Field>
        <FieldLabel htmlFor="kit-note">Note to mentor</FieldLabel>
        <Textarea id="kit-note" maxLength={300} placeholder="Hi! I'm moving to Atlanta too…" />
      </Field>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" onClick={() => toast.success("Saved to your Launch File")}>
          Show a toast
        </Button>
        <Button type="button" variant="outline" disabled>
          Disabled
        </Button>
      </div>
    </form>
  );
}

export function DisclosureDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Tabs defaultValue="career">
        <TabsList>
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>
        <TabsContent value="career" className="bg-area-career rounded-lg p-4">
          Review offer details · Set first 90-day career goals
        </TabsContent>
        <TabsContent value="financial" className="bg-area-financial rounded-lg p-4">
          Build first 90-day budget · Review paycheck & benefits
        </TabsContent>
      </Tabs>
      <Accordion type="single" collapsible>
        <AccordionItem value="q1">
          <AccordionTrigger>How is Beyond Blue different from Career Services?</AccordionTrigger>
          <AccordionContent>
            Career Services is part of Beyond Blue, but Beyond Blue connects career support with
            financial readiness, relocation planning, wellness, alumni mentorship, and real-world
            action.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q2">
          <AccordionTrigger>How will you measure success?</AccordionTrigger>
          <AccordionContent>
            Success is measured at Day 100, graduation, and Day +100.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
