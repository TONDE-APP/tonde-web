import { ArrowUpRight } from "lucide-react";

import { AnimatedWave } from "./animated-wave";

type FooterLink = {
  name: string;
  href: string;
};

const footerLinks: Record<string, FooterLink[]> = {
  Produit: [
    { name: "Produit", href: "#product" },
    { name: "Tarifs", href: "#pricing" },
    { name: "Témoignages", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
  ],
  Entreprise: [
    { name: "À propos", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Démo", href: "#" },
  ],
  Légal: [
    { name: "Confidentialité", href: "#" },
    { name: "Conditions", href: "#" },
    { name: "Sécurité", href: "#" },
  ],
};

const socialLinks = [
  { name: "LinkedIn", href: "#" },
  { name: "Email", href: "#" },
];

export function FooterSection() {
  return (
    <footer className="relative border-t border-border">
      <div className="pointer-events-none absolute inset-0 h-72 opacity-25 overflow-hidden">
        <AnimatedWave />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="py-16 lg:py-20">
          <div className="grid gap-12 md:grid-cols-6">
            <div className="md:col-span-2">
              <a href="#" className="inline-flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
                  T
                </span>
                <div>
                  <p className="font-display text-xl text-foreground">TONDE</p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Queue Intelligence
                  </p>
                </div>
              </a>

              <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">
                TONDE transforme le chaos de l’attente en une expérience de
                dignité pour les institutions africaines modernes.
              </p>

              <div className="mt-8 flex gap-5">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-semibold text-foreground">
                  {title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-border py-6 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>2026 TONDE. Tous droits réservés.</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em]">
            Burundi · RDC · Afrique de l’Est & Centrale
          </p>
        </div>
      </div>
    </footer>
  );
}
