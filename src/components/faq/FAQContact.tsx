import { Phone, Globe, Youtube } from "lucide-react";

const CONTACT = [
  { icon: <Phone size={18} />, label: "Phone / WhatsApp", value: "0916 489 6938" },
  { icon: <Globe size={18} />, label: "Website", value: "www.bjotofficial.com" },
  { icon: <Youtube size={18} />, label: "YouTube", value: "BJOT OFFICIAL" },
];

export default function FAQContact() {
  return (
    <>
      <section className="faq-contact" id='contact'>
        <div className="wrap faq-contact-inner">
          <div>
            <div className="eyebrow">Still Have Questions?</div>
            <h2>We&apos;re Here To Help You Succeed</h2>
          </div>
          <div className="faq-contact-list">
            {CONTACT.map((c) => (
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