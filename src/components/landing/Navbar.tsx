"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import logo from "../../../public/bjot-logo.png";

const LINKS = ["Home", "About Us", "Testimonials", "Support"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

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
        <button
          type="button"
          className="nav-menu-toggle"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>
      <div
        className={`mobile-nav-backdrop${menuOpen ? " is-open" : ""}`}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />
      <nav
        id="mobile-navigation"
        className={`mobile-nav${menuOpen ? " is-open" : ""}`}
        aria-label="Mobile navigation"
      >
        {LINKS.map((link) => (
          <a
            key={link}
            href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => setMenuOpen(false)}
          >
            {link}
          </a>
        ))}
        <a href="#" className="mobile-nav-login" onClick={() => setMenuOpen(false)}>
          Login
        </a>
        <a href="#" className="mobile-nav-join" onClick={() => setMenuOpen(false)}>
          Join Free
        </a>
      </nav>
    </motion.header>
  );
}