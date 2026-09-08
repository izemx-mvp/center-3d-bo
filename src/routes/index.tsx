import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Bot, LayoutGrid, ShieldCheck, Sparkles, Users } from "lucide-react";
import heroImage from "@/assets/hero-tractor.jpg";
import { AmbientBackground } from "@/components/AmbientBackground";
import { BrandLockup } from "@/components/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CENTRE 3D — Choisissez votre espace | Machines agricoles" },
      {
        name: "description",
        content:
          "Accédez à l'espace commercial ou à l'espace client d'CENTRE 3D : catalogue de machines agricoles, devis, commandes, paiements et suivi en temps réel.",
      },
      { property: "og:title", content: "CENTRE 3D — Plateforme digitale de machines agricoles" },
      {
        property: "og:description",
        content: "Attirer, qualifier, vendre, encaisser et facturer depuis une seule plateforme.",
      },
    ],
  }),
  component: SpaceSelector,
});

const SPACES = [
  {
    to: "/login/admin",
    eyebrow: "Équipes internes",
    title: "Espace commercial / Administration",
    description:
      "Pilotez vos ventes, prospects, clients, machines, devis et performances commerciales depuis un espace centralisé.",
    cta: "Accéder à l'espace commercial",
    icon: BarChart3,
    points: ["CRM & scoring IA", "Devis, commandes, facturation", "Analytics multi-régions"],
  },
  {
    to: "/login/client",
    eyebrow: "Clients & partenaires",
    title: "Espace client",
    description:
      "Consultez notre catalogue, vos demandes, devis, commandes, paiements et factures.",
    cta: "Accéder à l'espace client",
    icon: Users,
    points: ["Catalogue & favoris", "Devis en ligne", "Suivi de commande"],
  },
] as const;

function SpaceSelector() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[image:var(--gradient-hero)] text-primary-foreground">
      <img
        src={heroImage}
        alt="Tracteur moderne au coucher du soleil dans un champ de blé"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-80" />
      <AmbientBackground />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-8 md:px-8">
        <header className="flex items-center justify-between">
          <BrandLockup onDark className="text-primary-foreground" subtitle="Londres · Maroc · Europe" />
          <span className="hidden items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1.5 text-xs backdrop-blur md:inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            Qualification commerciale assistée par IA
          </span>
        </header>

        <main className="flex flex-1 flex-col justify-center py-14">
          <div className="max-w-3xl animate-rise-in">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs uppercase tracking-[0.2em]">
              Importation & distribution de machines agricoles
            </p>
            <h1 className="text-display">Bienvenue sur votre plateforme</h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/75">
              Choisissez l'espace auquel vous souhaitez accéder.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {SPACES.map((space, i) => {
              const Icon = space.icon;
              return (
                <Link
                  key={space.to}
                  to={space.to}
                  className="group relative overflow-hidden rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.06] p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary-glow/50 hover:bg-primary-foreground/[0.1] animate-rise-in"
                  style={{ animationDelay: `${150 + i * 120}ms` }}
                >
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-glow/20 blur-3xl transition-opacity duration-500 group-hover:opacity-100 md:opacity-0" />
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-glow/15 text-primary-glow ring-1 ring-primary-glow/30">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-primary-foreground/55">
                    {space.eyebrow}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">{space.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">{space.description}</p>
                  <ul className="mt-5 space-y-2">
                    {space.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-primary-foreground/65">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-glow" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-7 inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform duration-300 group-hover:gap-3">
                    {space.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/55">
          <div className="flex flex-wrap items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" /> 34 machines au catalogue
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5" /> Agent IA multi-canal
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Siège Londres · Réseau Maroc
            </span>
          </div>
          <span>© 2026 CENTRE 3D International Ltd.</span>
        </footer>
      </div>
    </div>
  );
}
