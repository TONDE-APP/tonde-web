import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimatedTetrahedron } from "./animated-tetrahedron";

export function CtaSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="tonde-panel relative overflow-hidden rounded-[28px] border border-primary/20 px-8 py-10 lg:px-12 lg:py-14 glow-violet">
          <div className="pointer-events-none absolute -right-16 top-1/2 hidden h-90 w-90 -translate-y-1/2 opacity-70 lg:block">
            <AnimatedTetrahedron />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
              Prochaine étape
            </span>
            <h2 className="mt-6 font-display text-4xl text-foreground md:text-5xl">
              Prêt à transformer l’accueil en une expérience digne et mesurable
              ?
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              TONDE aide les institutions à reprendre le contrôle de l’attente
              avec une approche moderne, fiable et pensée pour les réalités du
              terrain.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild className="bg-primary text-primary-foreground shadow-[0_16px_40px_rgba(108,71,255,0.35)]">
                <a href="/dashboard">
                  Demander une Démo
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                className="border-border bg-background/60 text-foreground"
              >
                Voir les tarifs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
