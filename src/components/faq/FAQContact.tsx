import { Phone, Globe, Youtube } from "lucide-react";
import type { Contact } from "@/lib/landing-content";

export default function FAQContact({ contact }: { contact: Contact | null }) {
  const entries = [
    { icon: <Phone size={18} />, label: "Phone / WhatsApp", value: contact?.whatsapp || contact?.phone },
    { icon: <Globe size={18} />, label: "Website", value: contact?.website },
    { icon: <Youtube size={18} />, label: "YouTube", value: contact?.youtube },
  ].filter((entry) => entry.value);
  if (!entries.length) return null;
  return (
    <>
      <section className="faq-contact" id='contact'>
        <div className="wrap faq-contact-inner">
          <div>
            <div className="eyebrow">Still Have Questions?</div>
            <h2>We&apos;re Here To Help You Succeed</h2>
          </div>
          <div className="faq-contact-list">
            {entries.map((c) => (
              <div className="faq-contact-item" key={c.label}>
                <span className="faq-contact-icon">{c.icon}</span>
                <div>
                  <div className="faq-contact-label">{c.label}</div>
                  <div className="faq-contact-value">{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
