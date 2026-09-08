import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { Download, KanbanSquare, LayoutList, PieChart, Search, SlidersHorizontal } from "lucide-react";
import { PageHeader, Panel, FilterChips, StatusPill, ScoreRing } from "@/components/ui-kit";
import { DataTable, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITIES, CHANNELS, LEAD_STATUSES, SALES_REPS, formatDate, sourceSeries, type Prospect } from "@/lib/data";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/admin/prospects/")({
  head: () => ({
    meta: [
      { title: "Prospects & CRM — CENTRE 3D" },
      {
        name: "description",
        content: "Pipeline commercial complet : scoring IA des prospects, vue tableau, kanban et analytics par source.",
      },
      { property: "og:title", content: "Prospects & CRM — CENTRE 3D" },
      { property: "og:description", content: "Qualification IA et suivi du pipeline de vente de machines agricoles." },
    ],
  }),
  component: ProspectsPage,
});

const ALL = "__all__";

function ProspectsPage() {
  const { prospects } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState(ALL);
  const [temp, setTemp] = useState(ALL);
  const [source, setSource] = useState(ALL);
  const [rep, setRep] = useState(ALL);

  const filtered = useMemo(
    () =>
      prospects.filter(
        (p) =>
          (!q ||
            `${p.name} ${p.company} ${p.city} ${p.interest}`.toLowerCase().includes(q.toLowerCase())) &&
          (city === ALL || p.city === city) &&
          (temp === ALL || p.temperature === temp) &&
          (source === ALL || p.source === source) &&
          (rep === ALL || p.rep === rep),
      ),
    [prospects, q, city, temp, source, rep],
  );

  const chips = [
    city !== ALL && { key: "city", label: city, onRemove: () => setCity(ALL) },
    temp !== ALL && { key: "temp", label: `Lead ${temp.toLowerCase()}`, onRemove: () => setTemp(ALL) },
    source !== ALL && { key: "src", label: source, onRemove: () => setSource(ALL) },
    rep !== ALL && { key: "rep", label: rep, onRemove: () => setRep(ALL) },
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

  const reset = () => {
    setCity(ALL);
    setTemp(ALL);
    setSource(ALL);
    setRep(ALL);
    setQ("");
  };

  const columns: Column<Prospect>[] = [
    {
      key: "name",
      header: "Prospect",
      sortValue: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-accent text-[11px] font-semibold text-accent-foreground">
              {p.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{p.name}</p>
            <p className="truncate text-xs text-muted-foreground">{p.company}</p>
          </div>
        </div>
      ),
    },
    { key: "city", header: "Ville", sortValue: (p) => p.city, render: (p) => <span className="text-muted-foreground">{p.city}</span> },
    { key: "source", header: "Source", render: (p) => <Badge variant="secondary">{p.source}</Badge> },
    {
      key: "score",
      header: "Score IA",
      sortValue: (p) => p.score,
      render: (p) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <div className="h-full gradient-primary" style={{ width: `${p.score}%` }} />
          </div>
          <span className="tabular-nums text-xs font-semibold">{p.score}</span>
        </div>
      ),
    },
    { key: "interest", header: "Intérêt", render: (p) => p.interest },
    { key: "rep", header: "Commercial", sortValue: (p) => p.rep, render: (p) => <span className="text-muted-foreground">{p.rep}</span> },
    { key: "status", header: "Statut", render: (p) => <StatusPill status={p.status} /> },
    {
      key: "last",
      header: "Dernière interaction",
      sortValue: (p) => p.lastInteraction,
      render: (p) => <span className="text-xs text-muted-foreground">{formatDate(p.lastInteraction)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospects & CRM"
        subtitle={`${filtered.length} prospects suivis sur ${prospects.length} au total`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Exporter
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow">
              Nouveau prospect
            </Button>
          </>
        }
      />

      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un prospect, une entreprise…" className="pl-9" />
          </div>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Ville" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes les villes</SelectItem>
              {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={temp} onValueChange={setTemp}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Température" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les leads</SelectItem>
              {["Chaud", "Tiède", "Froid"].map((t) => <SelectItem key={t} value={t}>Lead {t.toLowerCase()}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Canal" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les canaux</SelectItem>
              {CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={rep} onValueChange={setRep}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Commercial" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les commerciaux</SelectItem>
              {SALES_REPS.map((r) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={reset}>
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Réinitialiser
          </Button>
        </div>
        {chips.length > 0 && <div className="mt-4"><FilterChips chips={chips} onClear={reset} /></div>}
      </Panel>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table"><LayoutList className="mr-2 h-4 w-4" /> Tableau</TabsTrigger>
          <TabsTrigger value="kanban"><KanbanSquare className="mr-2 h-4 w-4" /> Kanban</TabsTrigger>
          <TabsTrigger value="analytics"><PieChart className="mr-2 h-4 w-4" /> Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <Panel padded={false}>
            <DataTable
              rows={filtered}
              columns={columns}
              onRowClick={(p) => navigate({ to: "/admin/prospects/$id", params: { id: p.id } })}
              emptyTitle="Aucun prospect trouvé"
              emptyDescription="Ajustez vos filtres ou créez un nouveau prospect pour démarrer."
            />
          </Panel>
        </TabsContent>

        <TabsContent value="kanban" className="mt-4">
          <div className="grid gap-4 overflow-x-auto md:grid-cols-3 xl:grid-cols-7">
            {LEAD_STATUSES.map((status) => {
              const items = filtered.filter((p) => p.status === status);
              return (
                <div key={status} className="min-w-[220px] rounded-xl border border-border bg-surface/60 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{status}</p>
                    <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
                  </div>
                  <ul className="space-y-2">
                    {items.slice(0, 6).map((p) => (
                      <li key={p.id}>
                        <Link
                          to="/admin/prospects/$id"
                          params={{ id: p.id }}
                          className="block rounded-lg border border-border bg-card p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
                        >
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{p.company}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <StatusPill status={p.temperature} />
                            <span className="text-xs font-semibold tabular-nums">{p.score}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                    {!items.length && <li className="px-1 py-6 text-center text-xs text-muted-foreground">Aucun prospect</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel className="lg:col-span-2" title="Leads par canal d'acquisition">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceSeries} margin={{ left: -18 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="source" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                    <RTooltip cursor={{ fill: "var(--color-muted)" }} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="leads" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Répartition par température">
              <ul className="space-y-4">
                {(["Chaud", "Tiède", "Froid"] as const).map((t) => {
                  const count = prospects.filter((p) => p.temperature === t).length;
                  return (
                    <li key={t}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <StatusPill status={t} />
                        <span className="tabular-nums text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full gradient-primary" style={{ width: `${(count / prospects.length) * 100}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 space-y-3">
                {SALES_REPS.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">{r.initials}</AvatarFallback></Avatar>
                      <span className="text-sm">{r.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {prospects.filter((p) => p.rep === r.name).length} leads
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>

      <Panel title="Top scoring IA" description="Les prospects les plus prometteurs du pipeline">
        <div className="grid gap-4 md:grid-cols-3">
          {[...filtered].sort((a, b) => b.score - a.score).slice(0, 3).map((p) => (
            <Link
              key={p.id}
              to="/admin/prospects/$id"
              params={{ id: p.id }}
              className="rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="flex items-center gap-4">
                <ScoreRing score={p.score} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.company}</p>
                  <StatusPill status={p.temperature} className="mt-2" />
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{p.aiSummary}</p>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
