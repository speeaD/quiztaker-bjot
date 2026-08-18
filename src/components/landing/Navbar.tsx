"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import logo from "../../../public/bjot-logo.png";

const LINKS = ["Home", "About Us", "Testimonials", "Support"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={`nav${scrolled ? " nav-scrolled" : ""}`}
      initial={prefersReducedMotion ? undefined : { y: -60, opacity: 0 }}
      animate={prefersReducedMotion ? undefined : { y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
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
    </motion.header>
  );
}