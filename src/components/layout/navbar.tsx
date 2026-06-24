"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Menu, X, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#technology", label: "Technology" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-gray-200/50 bg-white/80 shadow-glass backdrop-blur-glass"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <Container>
        <div className="flex h-16 items-center justify-between md:h-18">
          {/* Logo */}
          <Link
            href="/"
            className="relative z-50 flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <Sun className="h-7 w-7 text-primary-500" />
            <span className="text-lg font-bold tracking-tight">Solarcast</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-500"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/dashboard" className="btn-primary">
              <span className="hidden sm:inline">Explore Solar Potential</span>
              <span className="sm:hidden">Explore</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative z-50 rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-white transition-all duration-300 md:hidden ${
          mobileOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
        aria-hidden={!mobileOpen}
      >
        {navLinks.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={`text-2xl font-semibold text-gray-900 transition-all duration-300 hover:text-primary-500 ${
              mobileOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: mobileOpen ? `${i * 100}ms` : "0ms" }}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className={`btn-primary text-base transition-all duration-300 ${
            mobileOpen
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: mobileOpen ? "300ms" : "0ms" }}
        >
          Explore Solar Potential
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </nav>
  );
}
