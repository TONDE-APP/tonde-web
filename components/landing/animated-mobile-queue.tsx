"use client";

import { useEffect, useState } from "react";

const queueStates = [
  {
    position: "07",
    ticket: "T-051",
    time: "12 min",
    guichet: "B1",
    status: "En attente",
  },
  {
    position: "06",
    ticket: "T-051",
    time: "10 min",
    guichet: "B1",
    status: "En attente",
  },
  {
    position: "05",
    ticket: "T-051",
    time: "08 min",
    guichet: "B2",
    status: "Presque là",
  },
  {
    position: "04",
    ticket: "T-051",
    time: "06 min",
    guichet: "B2",
    status: "Presque là",
  },
  {
    position: "03",
    ticket: "T-051",
    time: "04 min",
    guichet: "B2",
    status: "Bientôt appelé",
  },
  {
    position: "02",
    ticket: "T-051",
    time: "02 min",
    guichet: "B3",
    status: "Bientôt appelé",
  },
  {
    position: "01",
    ticket: "T-051",
    time: "30 sec",
    guichet: "B3",
    status: "Prochain",
  },
] as const;

export function AnimatedMobileQueue() {
  const [stateIndex, setStateIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStateIndex((prev) => (prev + 1) % queueStates.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const currentState = queueStates[stateIndex];
  const progress = ((7 - parseInt(currentState.position)) / 6) * 100;

  return (
    <div
      className={`tonde-panel glow-violet relative overflow-hidden rounded-[24px] p-4 transition-all duration-700 sm:rounded-[28px] sm:p-5 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="mb-3.5 flex items-center justify-between sm:mb-4">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-primary sm:text-[9px] sm:tracking-[0.24em]">
            TONDE Mobile
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-foreground sm:text-xs">
            File d&apos;attente temps réel
          </p>
        </div>
        <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-primary sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.2em]">
          Live
        </span>
      </div>

      <div className="rounded-[18px] border border-border bg-background/80 p-4 sm:rounded-[20px] sm:p-5">
        <div className="mb-3.5 text-center sm:mb-4">
          <p className="font-mono text-[11px] text-muted-foreground sm:text-xs">
            Votre ticket
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-primary transition-all duration-500 sm:mt-1.5 sm:text-3xl">
            {currentState.ticket}
          </p>
        </div>

        <div className="mb-4 rounded-lg border border-accent/20 bg-accent/5 p-3.5 text-center sm:mb-5 sm:rounded-xl sm:p-4">
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            Position dans la file
          </p>
          <p className="mt-1 text-[3rem] font-bold leading-none text-foreground transition-all duration-500 sm:mt-1.5 sm:text-5xl">
            {currentState.position}
          </p>
        </div>

        <div className="mb-3.5 sm:mb-4">
          <div className="mb-1.5 flex items-center justify-between text-[9px] text-muted-foreground sm:text-[10px]">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          <div className="rounded-lg border border-border bg-background/60 p-2.5">
            <p className="text-[9px] text-muted-foreground sm:text-[10px]">
              Temps estimé
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground transition-all duration-500 sm:text-base">
              {currentState.time}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-2.5">
            <p className="text-[9px] text-muted-foreground sm:text-[10px]">
              Guichet
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground transition-all duration-500 sm:text-base">
              {currentState.guichet}
            </p>
          </div>
        </div>

        <div className="mt-3.5 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 sm:mt-4 sm:py-2.5">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 sm:h-2 sm:w-2" />
            <span className="text-[11px] font-medium text-emerald-400 transition-all duration-500 sm:text-xs">
              {currentState.status}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-center gap-1.5 sm:mt-4">
        <div className="h-1 w-1 rounded-full bg-accent" />
        <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[9px] sm:tracking-[0.2em]">
          Synchro temps réel active
        </p>
      </div>
    </div>
  );
}
