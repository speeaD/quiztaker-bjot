import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import type { Contact, SectionContent } from "@/lib/landing-content";

export default function Footer({ content, contact }: { content: SectionContent; contact: Contact | null }) {
  return (
    <footer>
      <div className="wrap">
        <Reveal className="footer-grid" distance={16} amount={0.1}>
          <div>
            <div className="footer-logo">{content.brand}</div>
            <p className="desc">{content.tagline}</p>
            <div className="socials">
              {contact?.whatsapp && <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} aria-label="WhatsApp"><Image src="/whatsapp.svg" alt="" width={20} height={20} /></a>}
              {contact?.youtube && <a href={contact.youtube.startsWith("http") ? contact.youtube : `https://www.youtube.com/results?search_query=${encodeURIComponent(contact.youtube)}`} aria-label="YouTube"><Image src="/youtube.svg" alt="" width={20} height={20} /></a>}
              {contact?.email && <a href={`mailto:${contact.email}`} aria-label="Email"><Image src="/maildotru.svg" alt="" width={20} height={20} /></a>}
            </div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about-us">About Us</Link></li>
              <li><Link href="/testimonials">Testimonials</Link></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><Link href="/support#contact">Contact Us</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms-of-use">Terms of Use</Link></li>
              <li><Link href="/support">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h4>Connect With Us</h4>
            <ul>
              {contact?.email && <li>{contact.email}</li>}
              {contact?.phone && <li>{contact.phone}</li>}
              {contact?.address && <li>{contact.address}</li>}
            </ul>
          </div>
        </Reveal>
        <div className="footer-bottom">
          <span>{content.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
