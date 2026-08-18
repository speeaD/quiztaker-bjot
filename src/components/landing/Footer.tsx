import Image from "next/image"
import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">BJOT</div>
            <p className="desc">
              Prepare Different, Score Higher. Nigeria&apos;s most trusted
              platform for JAMB, WAEC, NECO &amp; POST-UTME success.
            </p>
            <div className="socials">
              <span><Image src="/whatsapp.svg" alt="WhatsApp" width={20} height={20} /></span>
              <span><Image src="/youtube.svg" alt="YouTube" width={20} height={20} /></span>
              <span><Image src="/maildotru.svg" alt="Email" width={20} height={20} /></span>
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
              <li>blastjambonlinetutorial@gmail.com</li>
              <li>+234 916 489 6938</li>
              <li>Lagos, Nigeria</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 BJOT Blast Jamb Online Tutorial. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
