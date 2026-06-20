import Image from "next/image";

import { landingDemoEnvironment } from "@/lib/landing-demo";

const ecosystem = [
  {
    title: "App Mobile",
    subtitle: "Prise de ticket en 3 taps",
    description:
      "Le citoyen prend son ticket, suit sa position et reçoit les mises à jour sans rester physiquement bloqué sur place.",
    benefit: "Réduit l’incertitude et fluidifie l’arrivée sur site.",
    accent: "text-primary",
    dot: "bg-primary",
    asset: landingDemoEnvironment.assets.mobile,
    alt: "Mockup conceptuel de l'application mobile TONDE",
  },
  {
    title: "Guichet Desktop",
    subtitle: "Interface ultra-rapide pilotée au clavier",
    description:
      "Le poste agent privilégie la vitesse d’exécution, l’appel du ticket, la priorisation et la continuité de service.",
    benefit: "Réduit la friction opérationnelle pour les équipes terrain.",
    accent: "text-accent",
    dot: "bg-accent",
    asset: landingDemoEnvironment.assets.desktop,
    alt: "Mockup conceptuel du guichet desktop TONDE",
  },
  {
    title: "Affichage TV",
    subtitle: "Lisibilité à 10 mètres",
    description:
      "L’écran de salle d’attente rend les appels visibles instantanément, avec un format pensé pour les espaces publics à forte affluence.",
    benefit: "Rend la salle d’attente plus calme et plus compréhensible.",
    accent: "text-emerald-400",
    dot: "bg-emerald-400",
    asset: landingDemoEnvironment.assets.tv,
    alt: "Mockup conceptuel de l'affichage TV TONDE",
  },
  {
    title: "Dashboard Admin",
    subtitle: "KPIs temps réel et exports direction",
    description:
      "La direction suit l’affluence, les temps moyens, les no-show et la performance multi-sites depuis une seule vue consolidée.",
    benefit: "Transforme l’accueil en sujet mesurable et pilotable.",
    accent: "text-primary",
    dot: "bg-primary",
    asset: landingDemoEnvironment.assets.admin,
    alt: "Mockup conceptuel du dashboard admin TONDE",
  },
] as const;

export function EcosystemSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-14 max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            L’écosystème TONDE
          </span>
          <h2 className="mt-6 font-display text-4xl text-foreground md:text-5xl">
            Quatre interfaces, un seul moteur de coordination.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            TONDE relie l’expérience usager, l’exécution terrain, l’affichage
            public et le pilotage de direction dans une seule architecture.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {ecosystem.map((item, index) => (
            <article
              key={item.title}
              className="tonde-panel rounded-[22px] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  0{index + 1}
                </span>
                <span className={`text-sm font-semibold ${item.accent}`}>
                  {item.title}
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-background/75 p-3">
                <Image
                  src={item.asset}
                  alt={item.alt}
                  width={1440}
                  height={960}
                  className="h-auto w-full rounded-xl border border-border/70"
                />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {item.subtitle}
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {item.description}
              </p>

              <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${item.dot}`}
                  />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      Impact décisionnel
                    </p>
                    <p className="mt-2 text-sm text-foreground/90">
                      {item.benefit}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
