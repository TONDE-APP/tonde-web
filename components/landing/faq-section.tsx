const faqs = [
  {
    question: "Les applications TONDE sont-elles déjà disponibles ?",
    answer:
      "Pas encore. La landing actuelle présente des mockups conceptuels remplaçables pendant que les applications mobile, guichet, TV et admin sont en développement.",
  },
  {
    question: "TONDE est-il adapté aux coupures internet fréquentes ?",
    answer:
      "Oui. L’architecture cible met en avant une logique offline-first avec cache local et resynchronisation à la reconnexion.",
  },
  {
    question: "Le système est-il pensé pour les banques et les hôpitaux ?",
    answer:
      "Oui. Le positionnement cible prioritairement les institutions à forte affluence, en particulier les banques, les hôpitaux et d’autres services structurés accueillant du public.",
  },
  {
    question: "Comment les données sont-elles séparées entre institutions ?",
    answer:
      "TONDE met en avant un cloisonnement fort par institution avec PostgreSQL, Row Level Security et contrôle d’accès par rôles.",
  },
  {
    question: "La direction peut-elle obtenir des rapports ?",
    answer:
      "Oui. Le dashboard admin est conçu pour fournir des KPIs temps réel ainsi que des exports Excel et PDF pour le pilotage.",
  },
] as const;

export function FaqSection() {
  return (
    <section id="faq" className="py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mb-14 max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            FAQ
          </span>
          <h2 className="mt-6 font-display text-4xl text-foreground md:text-5xl">
            Réponses rapides aux questions de direction.
          </h2>
        </div>

        <div className="grid gap-4">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group tonde-card rounded-2xl p-6"
            >
              <summary className="cursor-pointer list-none text-lg font-semibold text-foreground marker:hidden">
                {item.question}
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
