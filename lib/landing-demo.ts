export const landingDemoEnvironment = {
  mode: "concept-mockups",
  note: "Les applications TONDE sont encore en développement. La landing utilise des mockups conceptuels remplaçables.",
  assets: {
    mobile: "/assets/mockups/mobile-app-concept.svg",
    desktop: "/assets/mockups/desktop-guichet-concept.svg",
    tv: "/assets/mockups/tv-display-concept.svg",
    admin: "/assets/mockups/admin-dashboard-concept.svg",
  },
  readiness: {
    mobile: false,
    desktop: false,
    tv: false,
    admin: false,
  },
} as const;
