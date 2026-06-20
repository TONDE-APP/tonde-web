import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    description:
      "Pour les agences individuelles qui veulent structurer rapidement l’accueil.",
    commercialModel: "Pilote cadré",
    features: [
      "Déploiement site unique",
      "Mise en file standard",
      "Suivi des tickets en temps réel",
      "Accompagnement de démarrage",
    ],
    cta: "Demander une démo",
    popular: false,
  },
  {
    name: "Business",
    description:
      "Pour les institutions qui veulent réconciliation Mobile Money et rapports avancés.",
    commercialModel: "Sur étude",
    features: [
      "Réconciliation Mobile Money",
      "Rapports avancés",
      "Supervision multi-services",
      "KPIs temps réel pour le management",
    ],
    cta: "Parler à l’équipe",
    popular: true,
  },
  {
    name: "Enterprise",
    description:
      "Pour les réseaux multi-agences avec exigences fortes de pilotage et d’intégration.",
    commercialModel: "Sur mesure",
    features: [
      "Déploiement multi-agences",
      "Analytics prédictifs à terme",
      "Support dédié",
      "Cadrage et accompagnement sur mesure",
    ],
    cta: "Construire une offre",
    popular: false,
  },
] as const;

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-14 max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            Tarification
          </span>
          <h2 className="mt-6 font-display text-4xl text-foreground md:text-5xl">
            Trois cadres commerciaux pour les institutions qui veulent
            structurer l’accueil.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Les montants finaux dépendent du périmètre, du nombre de sites, du
            niveau d’accompagnement et des intégrations attendues.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-3xl p-7 ${plan.popular ? "tonde-panel glow-violet" : "tonde-card"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                {plan.popular && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                    Recommandé
                  </span>
                )}
              </div>

              <div className="mt-8 border-y border-border py-8">
                <p className="font-display text-4xl text-foreground">
                  {plan.commercialModel}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Modèle commercial adapté au niveau de maturité du projet.
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-1 rounded-full bg-emerald-500/10 p-1 text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-10 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all hover:brightness-110 ${
                  plan.popular
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background/60 text-foreground"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
