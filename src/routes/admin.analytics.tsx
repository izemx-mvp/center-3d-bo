import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import { Activity, Percent, Target, TrendingUp } from "lucide-react";
import { KpiCard, PageHeader, Panel } from "@/components/ui-kit";
import {
  citySeries,
  formatMAD,
  funnelSeries,
  repSeries,
  salesSeries,
  sourceSeries,
} from "@/lib/data";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics commerciales — CENTRE 3D" },
      { name: "description", content: "Analyse de la performance commerciale : chiffre d'affaires, tunnel de conversion, sources de leads et performance par commercial." },
      { property: "og:title", content: "Analytics commerciales — CENTRE 3D" },
      { property: "og:description", content: "Tableaux de bord analytiques du réseau de distribution de machines agricoles." },
    ],
  }),
  component: AnalyticsPage,
});

const CHART_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-primary)"];

const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.6rem",
  fontSize: "0.8rem",
};

function AnalyticsPage() {
  const totalCA = salesSeries.reduce((s, x) => s + x.ca, 0) * 1000;
  const conversion = (funnelSeries[3]!.value / funnelSeries[0]!.value) * 100;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Performance commerciale sur les 8 derniers mois" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="CA cumulé" value={totalCA} format={formatMAD} icon={<TrendingUp className="h-4 w-4" />} delta={14.6} index={0} />
        <KpiCard label="Taux de conversion" value={conversion} format={(n) => `${n.toFixed(1)} %`} icon={<Percent className="h-4 w-4" />} delta={2.3} index={1} />
        <KpiCard label="Leads générés" value={funnelSeries[0]!.value} icon={<Target className="h-4 w-4" />} delta={18.4} index={2} />
        <KpiCard label="Devis émis" value={funnelSeries[2]!.value} icon={<Activity className="h-4 w-4" />} delta={6.9} index={3} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Chiffre d'affaires vs objectif" description="En milliers de MAD">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={salesSeries}>
              <defs>
                <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="ca" name="CA réalisé" stroke="var(--color-primary)" fill="url(#caGrad)" strokeWidth={2} />
              <Line type="monotone" dataKey="objectif" name="Objectif" stroke="var(--color-chart-4)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Tunnel de conversion" description="Du lead à la commande signée">
          <ul className="space-y-4">
            {funnelSeries.map((f, i) => {
              const pct = (f.value / funnelSeries[0]!.value) * 100;
              return (
                <li key={f.stage}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{f.stage}</span>
                    <span className="text-muted-foreground">{f.value} · {pct.toFixed(1)} %</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-[width] duration-1000"
                      style={{ width: `${pct}%`, opacity: 1 - i * 0.12 }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 rounded-lg bg-surface p-3 text-xs text-muted-foreground">
            Le passage « Qualifiés → Devis » reste le principal point de friction : accélérer l'envoi des devis
            de 24 h ferait gagner environ 9 commandes par trimestre.
          </p>
        </Panel>

        <Panel title="Sources de leads">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={sourceSeries} dataKey="leads" nameKey="source" innerRadius={62} outerRadius={104} paddingAngle={3}>
                {sourceSeries.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Demandes par ville">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={citySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="city" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-accent)" }} />
              <Bar dataKey="demandes" name="Demandes" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Performance par commercial" description="CA en milliers de MAD et taux de transformation">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={repSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="rep" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} unit=" %" />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-accent)" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="ca" name="CA" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="taux" name="Taux de transformation" stroke="var(--color-chart-4)" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
