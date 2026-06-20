"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Produit", href: "#product" },
  { name: "Tarifs", href: "#pricing" },
  { name: "Témoignages", href: "#testimonials" },
  { name: "FAQ", href: "#faq" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? "px-3 pt-3 sm:px-4 sm:pt-4" : "px-0 pt-0"
      }`}
    >
      <nav
        className={`mx-auto max-w-7xl transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? "tonde-card rounded-2xl"
            : "bg-transparent"
        }`}
      >
        <div
          className={`flex items-center justify-between px-4 sm:px-6 lg:px-8 ${
            isScrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
          }`}
        >
          <a href="#" className="flex items-center gap-2.5 sm:gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary glow-violet sm:h-10 sm:w-10">
              T
            </span>
            <div className="flex flex-col">
              <span className="font-display text-base text-foreground sm:text-lg">
                TONDE
              </span>
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:inline">
                Main Light
              </span>
            </div>
          </a>

          <div className="hidden items-center gap-8 md:flex lg:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button className="h-10 cursor-pointer bg-primary text-primary-foreground shadow-[0_12px_32px_rgba(108,71,255,0.35)] hover:bg-primary/95">
              Demander une Démo
            </Button>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-primary md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-border px-4 pb-6 pt-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg py-2.5 text-base font-medium text-foreground transition-colors hover:text-primary"
                >
                  {link.name}
                </a>
              ))}
              <Button
                className="mt-2 h-12 cursor-pointer bg-primary text-primary-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Demander une Démo
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
