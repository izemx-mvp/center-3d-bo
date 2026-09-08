import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Boxes,
  CalendarClock,
  FileText,
  Flame,
  Sparkles,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { KpiCard, Panel, PageHeader, ScoreRing, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  aiInsights,
  dayActions,
  formatMAD,
  funnelSeries,
  machines,
  salesSeries,
} from "@/lib/data";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard commercial — CENTRE 3D" },
      {
        name: "description",
        content:
          "Vue d'ensemble de l'activité commerciale CENTRE 3D : chiffre d'affaires, prospects, devis, commandes et insights IA.",
      },
      { property: "og:title", content: "Dashboard commercial — CENTRE 3D" },
      { property: "og:description", content: "Pilotage commercial en temps réel des ventes de machines agricoles." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { prospects, quotes, orders } = useApp();
  const hotLeads = prospects.filter((p) => p.temperature === "Chaud").slice(0, 5);
  const topMachines = [...machines].sort((a, b) => b.demand - a.demand).slice(0, 4);
  const maxFunnel = funnelSeries[0]!.value;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bonjour Mohamed"
        subtitle="Voici l'activité commerciale de votre entreprise aujourd'hui."
        actions={
          <>
            <Button variant="outline" size="sm">
              <CalendarClock className="mr-2 h-4 w-4" /> Août 2026
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow" asChild>
              <Link to="/admin/devis">
                <FileText className="mr-2 h-4 w-4" /> Créer un devis
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard index={0} label="Chiffre d'affaires" value={4820000} delta={18.4} icon={<TrendingUp className="h-4 w-4" />} format={(n) => `${(n / 1_000_000).toFixed(2)} M MAD`} />
        <KpiCard index={1} label="Nouveaux prospects" value={186} delta={12.7} icon={<Target className="h-4 w-4" />} />
        <KpiCard index={2} label="Leads qualifiés" value={74} delta={6.2} icon={<Flame className="h-4 w-4" />} />
        <KpiCard index={3} label="Devis en cours" value={quotes.filter((q) => q.status === "Envoyé" || q.status === "En négociation").length} icon={<FileText className="h-4 w-4" />} hint="à relancer" />
        <KpiCard index={4} label="Commandes" value={orders.length} delta={9.1} icon={<ShoppingCart className="h-4 w-4" />} />
        <KpiCard index={5} label="Machines disponibles" value={127} icon={<Boxes className="h-4 w-4" />} hint="9 villes" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Performance commerciale"
          description="Chiffre d'affaires mensuel vs objectif (k MAD)"
          action={<Badge variant="secondary">+18,4 % vs 2025</Badge>}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesSeries} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <RTooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="ca" name="CA réalisé" stroke="var(--color-chart-1)" strokeWidth={2.5} fill="url(#ca)" />
                <Area type="monotone" dataKey="objectif" name="Objectif" stroke="var(--color-chart-3)" strokeDasharray="5 5" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Funnel commercial" description="Leads → Qualifiés → Devis → Commandes">
          <ul className="space-y-4">
            {funnelSeries.map((f, i) => (
              <li key={f.stage}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{f.stage}</span>
                  <span className="tabular-nums text-muted-foreground">{f.value}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full gradient-primary transition-[width] duration-1000"
                    style={{ width: `${(f.value / maxFunnel) * 100}%`, opacity: 1 - i * 0.15 }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Taux de conversion global</p>
            <p className="mt-1 font-display text-2xl font-bold">10,7 %</p>
            <p className="mt-1 text-xs text-success">+2,3 pts vs trimestre précédent</p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Machines les plus demandées"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/catalogue">
                Voir le catalogue <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {topMachines.map((m) => (
              <article key={m.id} className="group flex gap-4 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-primary/40">
                <img
                  src={m.image}
                  alt={m.name}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-20 w-28 shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.category} · {m.power}</p>
                  <p className="mt-1 text-sm font-semibold text-primary">{formatMAD(m.price)}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                      <div className="h-full gradient-primary" style={{ width: `${m.demand}%` }} />
                    </div>
                    <span className="text-[11px] text-muted-foreground">{m.demand} demandes</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="AI Business Insights" description="Analyse générée par votre agent commercial IA">
          <ul className="space-y-3">
            {aiInsights.map((insight) => (
              <li key={insight} className="flex gap-3 rounded-lg border border-primary/15 bg-primary/[0.04] p-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-snug">{insight}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Opportunités importantes"
          description="Leads chauds à traiter en priorité"
          padded={false}
        >
          <ul className="divide-y divide-border">
            {hotLeads.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                    {p.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.company} · {p.city} · {p.interest}
                  </p>
                </div>
                <span className="hidden text-sm font-semibold text-primary sm:block">
                  {formatMAD(p.budgetMax)}
                </span>
                <StatusPill status={p.temperature} />
                <ScoreRing score={p.score} size={44} />
                <Button size="sm" variant="outline" asChild>
                  <Link to="/admin/prospects/$id" params={{ id: p.id }}>
                    Ouvrir
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Actions du jour" description="Vendredi 28 août 2026">
          <ul className="space-y-3">
            {dayActions.map((a) => (
              <li key={a.label} className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-surface">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {a.type === "Devis" ? <FileText className="h-4 w-4" /> : a.type === "Lead" ? <Users className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{a.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.due} · priorité {a.priority.toLowerCase()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Demandes par ville" description="Répartition géographique des demandes entrantes">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesSeries} margin={{ left: -18, right: 8 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <RTooltip
                cursor={{ fill: "var(--color-muted)" }}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="devis" name="Devis émis" radius={[6, 6, 0, 0]}>
                {salesSeries.map((_, i) => (
                  <Cell key={i} fill={i === salesSeries.length - 1 ? "var(--color-chart-2)" : "var(--color-chart-1)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
