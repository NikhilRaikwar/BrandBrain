"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question} className="rounded-2xl border border-[var(--border)] bg-white">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-semibold text-[var(--ink)]">{item.question}</span>
              <ChevronDown className={cn("h-4 w-4 text-[var(--ink3)] transition-transform", open && "rotate-180")} />
            </button>
            {open ? (
              <div className="px-5 pb-4 text-sm leading-7 text-[var(--ink3)]">{item.answer}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
