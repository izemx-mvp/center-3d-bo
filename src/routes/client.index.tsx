import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Receipt, ShoppingCart, Sparkles } from "lucide-react";
import { KpiCard, Panel, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";
import { formatDate, formatMAD, machines } from "@/lib/data";
import heroTractor from "@/assets/hero-tractor.jpg";

export const Route = createFileRoute("/client/")({
  head: () => ({
    meta: [
      { title: "Mon espace client — CENTRE 3D" },
      { name: "description", content: "Suivez vos demandes, devis, commandes et factures de machines agricoles depuis un espace unique." },
      { property: "og:title", content: "Mon espace client — CENTRE 3D" },
      { property: "og:description", content: "Vue d'ensemble de vos achats de machines agricoles : devis, commandes, livraisons et factures." },
    ],
  }),
  component: ClientHome,
});

function ClientHome() {
  const { user, demandes, quotes, orders, invoices } = useApp();
  const myQuotes = quotes.slice(0, 4);
  const myOrders = orders.slice(0, 4);
  const suggestions = machines.slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border shadow-elevated">
        <img src={heroTractor} alt="Tracteur moderne en plein champ au lever du jour" width={1920} height={800} className="h-[280px] w-full object-cover" />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-85" />
        <div className="absolute inset-0 flex flex-col justify-center gap-4 p-8 lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">Espace client</p>
          <h1 className="max-w-xl font-display text-3xl font-bold text-primary-foreground lg:text-4xl">
            Bonjour {user?.name.split(" ")[0]}, votre parc s'agrandit
          </h1>
          <p className="max-w-lg text-sm text-primary-foreground/80">
            Explorez le catalogue, demandez un devis en quelques secondes et suivez vos commandes jusqu'à la livraison.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link to="/client/catalogue">Parcourir le catalogue <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/client/assistant">Parler à l'assistant IA</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Demandes en cours" value={demandes.filter((d) => d.status !== "Clôturée").length} icon={<FileText className="h-4 w-4" />} index={0} />
        <KpiCard label="Devis reçus" value={myQuotes.length} icon={<FileText className="h-4 w-4" />} index={1} />
        <KpiCard label="Commandes" value={myOrders.length} icon={<ShoppingCart className="h-4 w-4" />} index={2} />
        <KpiCard label="Factures" value={invoices.slice(0, 6).length} icon={<Receipt className="h-4 w-4" />} index={3} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Mes derniers devis" action={<Button variant="ghost" size="sm" asChild><Link to="/client/devis">Tout voir</Link></Button>} padded={false}>
          <ul className="divide-y divide-border">
            {myQuotes.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{q.machineName}</p>
                  <p className="text-xs text-muted-foreground">{q.id} · {formatDate(q.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary">{formatMAD(q.total)}</span>
                  <StatusPill status={q.status} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Suivi de mes commandes" action={<Button variant="ghost" size="sm" asChild><Link to="/client/commandes">Tout voir</Link></Button>} padded={false}>
          <ul className="divide-y divide-border">
            {myOrders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.machineName}</p>
                  <p className="text-xs text-muted-foreground">{o.id} · livraison {o.deliveryCity}</p>
                </div>
                <StatusPill status={o.status} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Recommandations personnalisées"
        description="Sélection de l'assistant IA en fonction de votre exploitation"
        action={<Sparkles className="h-4 w-4 text-primary" />}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {suggestions.map((m) => (
            <Link key={m.id} to="/client/catalogue/$id" params={{ id: m.id }} className="overflow-hidden rounded-xl border border-border transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <img src={m.image} alt={m.name} loading="lazy" width={1024} height={768} className="h-36 w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.power} · {m.city}</p>
                <p className="mt-1 text-sm font-semibold text-primary">{formatMAD(m.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
