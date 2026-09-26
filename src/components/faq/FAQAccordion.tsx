"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SectionContent } from "@/lib/landing-content";



export default function FAQAccordion({ categories }: { categories: NonNullable<SectionContent["categories"]> }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="faq-section">
      <div className="wrap faq-wrap">
        {categories.map((group) => (
          <div className="faq-category" key={group.title}>
            <h2 className="faq-category-title">{group.title}</h2>
            <div className="faq-list">
              {group.items.map((item) => {
                const id = `${group.title}-${item.question}`;
                const isOpen = openId === id;
                return (
                  <div
                    className={`faq-item${isOpen ? " is-open" : ""}`}
                    key={id}
                  >
                    <button
                      className="faq-question"
                      onClick={() => setOpenId(isOpen ? null : id)}
                      aria-expanded={isOpen}
                    >
                      {item.question}
                      <ChevronDown size={18} className="faq-chevron" />
                    </button>
                    <p className="faq-answer" hidden={!isOpen}>{item.answer}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
