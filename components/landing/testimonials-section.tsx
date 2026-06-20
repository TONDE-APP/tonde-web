const signals = [
  {
    persona: "Direction Banque",
    title: "Réduire l’attrition en agence",
    quote:
      "Nous voulons rendre l’accueil plus lisible, réduire les abandons et protéger la valeur de chaque visite client.",
  },
  {
    persona: "Management Hôpital",
    title: "Organiser les flux sans alourdir le terrain",
    quote:
      "Nous avons besoin d’un système qui fluidifie l’orientation et l’attente sans ajouter de complexité aux équipes.",
  },
  {
    persona: "Direction Réseau",
    title: "Piloter plusieurs sites avec des indicateurs fiables",
    quote:
      "Le vrai besoin est d’obtenir une lecture temps réel du réseau, avec des rapports exploitables pour la direction.",
  },
] as const;

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-14 max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            Signaux terrain
          </span>
          <h2 className="mt-6 font-display text-4xl text-foreground md:text-5xl">
            Les décideurs n’achètent pas un écran. Ils achètent de la clarté.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Ces formulations représentent des attentes typiques du marché ciblé,
            pas des témoignages clients déjà signés.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {signals.map((item) => (
            <article
              key={item.persona}
              className="tonde-card rounded-[22px] p-6"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {item.persona}
              </p>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-5 text-lg leading-8 text-foreground">
                “{item.quote}”
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
