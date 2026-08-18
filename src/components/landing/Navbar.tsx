import Image from "next/image";
import logo from "../../../public/bjot-logo.png";

const LINKS = [
  "Home",
  "About Us",
  "Testimonials",
  "Support",
];

export default function Navbar() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="logo">
          <Image
            src={logo}
            alt="BJOT Logo"
            width={250}
            height={150}
            priority
            className="logo-image"
          />
        </div>
        <nav className="links">
          {LINKS.map((link) => (
            <a key={link} href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}>
              {link}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <a href="#" className="btn-login">
            Login
          </a>
          <a href="#" className="btn-join">
            Join Free
          </a>
        </div>
      </div>
    </header>
  );
}
