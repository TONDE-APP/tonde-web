"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { landingDemoEnvironment } from "@/lib/landing-demo";
import { AnimatedMobileQueue } from "./animated-mobile-queue";
import { AnimatedSphere } from "./animated-sphere";

const heroSignals = [
  { label: "Temps réel", value: "< 100ms visés" },
  { label: "Résilience", value: "Offline-first" },
  { label: "Sécurité", value: "RLS institutionnel" },
] as const;

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pt-20 pb-8 sm:px-6 lg:px-8 lg:pt-28 lg:pb-12">
      <div className="pointer-events-none absolute -right-20 top-20 h-130 w-130 opacity-40 lg:h-180 lg:w-180 lg:opacity-60">
        <AnimatedSphere />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-10 lg:opacity-15">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-white/8"
            style={{ top: `${(i + 1) * 11}%` }}
          />
        ))}
        {[...Array(7)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-white/8"
            style={{ left: `${(i + 1) * 13}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
        <div className="flex flex-col">
          <div
            className={`mb-3 transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-primary sm:gap-2.5 sm:px-3.5 sm:text-[10px] sm:tracking-[0.24em]">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="hidden sm:inline">
                Infrastructure intelligente de file d'attente
              </span>
              <span className="sm:hidden">Gestion intelligente de file</span>
            </span>
          </div>

          <h1
            className={`font-display text-[2rem] leading-[0.95] text-foreground transition-all duration-1000 sm:text-[2.5rem] md:text-5xl lg:text-6xl ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            Transformez le chaos de l&apos;attente en une expérience de dignité.
          </h1>

          <p
            className={`mt-3 max-w-2xl text-base leading-7 text-muted-foreground transition-all duration-700 delay-150 sm:mt-4 sm:text-lg sm:leading-8 md:text-xl ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            TONDE est l&apos;infrastructure intelligente de gestion de files
            d&apos;attente conçue pour les{" "}
            <span className="font-semibold text-accent">
              institutions africaines modernes
            </span>
            .
          </p>

          <div
            className={`mt-4 max-w-2xl rounded-xl border-2 border-accent/40 bg-card/70 p-3.5 transition-all duration-700 delay-200 sm:mt-5 sm:p-4 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex items-start gap-2.5 sm:gap-3">
              <span className="mt-0.5 h-2 w-2 rounded-full bg-accent sm:h-2.5 sm:w-2.5" />
              <p className="text-sm font-medium leading-relaxed text-foreground sm:text-[15px]">
                {landingDemoEnvironment.note}
              </p>
            </div>
          </div>

          <div
            className={`mt-4 flex flex-col gap-3 transition-all duration-700 delay-300 sm:mt-5 sm:flex-row ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <Button
              asChild
              className="h-12 cursor-pointer bg-primary text-primary-foreground shadow-[0_16px_40px_rgba(108,71,255,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_48px_rgba(108,71,255,0.5)] sm:h-10"
            >
              <a href="/dashboard">
                Demander une Démo
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 cursor-pointer border-border bg-card/40 text-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-card/80 sm:h-10"
            >
              <a href="#pricing">Voir les tarifs</a>
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-3">
            {heroSignals.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-accent/30 bg-gradient-to-br from-card/95 to-card/80 p-3.5 shadow-[0_8px_32px_rgba(0,212,255,0.12)] backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:shadow-[0_8px_32px_rgba(0,212,255,0.2)] sm:p-4"
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent sm:text-xs sm:tracking-[0.22em]">
                  {item.label}
                </p>
                <p className="mt-2 text-base font-bold text-foreground sm:mt-2.5 sm:text-lg">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-8 flex items-start justify-center lg:mt-0 lg:justify-end">
          <div className="w-full max-w-[340px] sm:max-w-[380px]">
            <AnimatedMobileQueue />
          </div>
        </div>
      </div>
    </section>
  );
}
