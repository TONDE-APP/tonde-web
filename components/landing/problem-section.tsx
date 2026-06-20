const impacts = [
  {
    title: "Pertes de revenus",
    body: "Chaque abandon de file ou délai excessif réduit la conversion commerciale et détériore la valeur de chaque visite en agence.",
  },
  {
    title: "Stress cognitif",
    body: "Quand l’usager ne sait ni quand il passera ni où aller, l’attente devient une source d’anxiété et de tensions.",
  },
  {
    title: "Surcharge opérationnelle",
    body: "Sans priorisation claire ni visibilité temps réel, les équipes subissent les pics d’affluence au lieu de les orchestrer.",
  },
  {
    title: "Image institutionnelle",
    body: "Une expérience d’accueil confuse affaiblit la confiance accordée à la banque, à l’hôpital ou à l’administration.",
  },
] as const;

export function ProblemSection() {
  return (
    <section id="product" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            Le problème
          </span>
          <h2 className="mt-6 font-display text-4xl text-foreground md:text-5xl">
            La réalité de l’attente ne coûte pas seulement du temps.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Elle détruit de la clarté, fait monter la pression sur les équipes,
            pousse des usagers à abandonner la file et affaiblit la performance
            des institutions. TONDE part de cette réalité africaine concrète.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="tonde-panel glow-violet rounded-3xl p-8">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
              Signal critique
            </p>
            <p className="mt-6 text-6xl font-display text-foreground md:text-7xl">
              22%
            </p>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              des usagers abandonnent la file avant d’être servis en Afrique
              subsaharienne.
            </p>
            <div className="mt-8 rounded-2xl border border-border bg-background/55 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Ce que cela signifie pour une direction
              </p>
              <p className="mt-3 text-sm leading-7 text-foreground/90">
                Une file mal pilotée n’est pas un simple irritant : c’est une
                perte de revenus, une source de surcharge terrain et un signal
                négatif envoyé à chaque visiteur.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {impacts.map((item) => (
              <article key={item.title} className="tonde-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
