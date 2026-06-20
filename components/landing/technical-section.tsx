const proofCards = [
  {
    title: "Temps réel",
    value: "< 100ms",
    description:
      "La cible est une propagation quasi instantanée des mises à jour entre mobile, guichet, TV et dashboard pour garder la file compréhensible.",
    proof: "WebSocket live entre les interfaces",
    tone: "glow-cyan",
  },
  {
    title: "Offline-First",
    value: "Résilient",
    description:
      "Le système est pensé pour continuer à opérer malgré les coupures internet grâce au cache local, puis à se resynchroniser proprement.",
    proof: "Continuité de service sur réseau instable",
    tone: "glow-violet",
  },
  {
    title: "Sécurité",
    value: "RLS",
    description:
      "Les données sont cloisonnées par institution avec PostgreSQL et Row Level Security pour éviter tout mélange entre organisations.",
    proof: "Isolation des données et contrôle d’accès",
    tone: "",
  },
] as const;

export function TechnicalSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-14 max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            Preuve de fiabilité
          </span>
          <h2 className="mt-6 font-display text-4xl text-foreground md:text-5xl">
            Une architecture pensée pour le terrain, pas seulement pour la démo.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            TONDE doit rassurer les décideurs avec des preuves concrètes de
            robustesse : latence maîtrisée, continuité de service et sécurité
            institutionnelle.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {proofCards.map((card) => (
            <article
              key={card.title}
              className={`tonde-panel rounded-[22px] p-6 ${card.tone}`}
            >
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {card.title}
              </p>
              <p className="mt-6 font-display text-5xl text-foreground">
                {card.value}
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {card.description}
              </p>

              <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                  <span className="text-sm text-foreground/90">
                    {card.proof}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
