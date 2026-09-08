import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, Search, Users, Wallet } from "lucide-react";
import { PageHeader, Panel, KpiCard } from "@/components/ui-kit";
import { DataTable, type Column } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITIES, clients, formatDate, formatMAD, type Client } from "@/lib/data";


export const Route = createFileRoute("/admin/clients")({
  head: () => ({
    meta: [
      { title: "Clients — CENTRE 3D" },
      { name: "description", content: "Base clients complète : segments, chiffre d'affaires, commandes et commercial référent." },
      { property: "og:title", content: "Base clients — CENTRE 3D" },
      { property: "og:description", content: "42 clients actifs, segmentation et suivi du chiffre d'affaires." },
    ],
  }),
  component: ClientsPage,
});

const ALL = "__all__";

function ClientsPage() {
  const [q, setQ] = useState("");
  const [segment, setSegment] = useState(ALL);
  const [city, setCity] = useState(ALL);

  const rows = useMemo(
    () =>
      clients.filter(
        (c) =>
          (!q || `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(q.toLowerCase())) &&
          (segment === ALL || c.segment === segment) &&
          (city === ALL || c.city === city),
      ),
    [q, segment, city],
  );

  const ca = rows.reduce((s, c) => s + c.totalSpent, 0);

  const columns: Column<Client>[] = [
    {
      key: "client",
      header: "Client",
      sortValue: (c) => c.name,
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {c.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{c.name}</p>
            <p className="truncate text-xs text-muted-foreground">{c.company}</p>
          </div>
        </div>
      ),
    },
    { key: "contact", header: "Contact", render: (c) => (<div className="text-xs"><p>{c.email}</p><p className="text-muted-foreground">{c.phone}</p></div>) },
    { key: "loc", header: "Localisation", sortValue: (c) => c.city, render: (c) => `${c.city}, ${c.country}` },
    { key: "seg", header: "Segment", sortValue: (c) => c.segment, render: (c) => <Badge variant="secondary">{c.segment}</Badge> },
    { key: "orders", header: "Commandes", sortValue: (c) => c.orders, render: (c) => c.orders },
    { key: "ca", header: "CA cumulé", sortValue: (c) => c.totalSpent, render: (c) => <span className="font-medium text-primary">{formatMAD(c.totalSpent)}</span> },
    { key: "since", header: "Client depuis", sortValue: (c) => c.since, render: (c) => formatDate(c.since) },
    { key: "rep", header: "Commercial", sortValue: (c) => c.rep, render: (c) => c.rep },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" subtitle={`${rows.length} clients dans votre portefeuille`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Clients actifs" value={rows.length} icon={<Users className="h-4 w-4" />} delta={6.4} index={0} />
        <KpiCard label="CA cumulé" value={ca} format={formatMAD} icon={<Wallet className="h-4 w-4" />} delta={12.1} index={1} />
        <KpiCard
          label="Panier moyen"
          value={rows.length ? ca / rows.length : 0}
          format={formatMAD}
          icon={<Building2 className="h-4 w-4" />}
          delta={3.2}
          index={2}
        />
      </div>

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un client…" className="pl-9" />
          </div>
          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Segment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les segments</SelectItem>
              {["Grand compte", "PME", "Coopérative", "Exploitant"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Ville" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes les villes</SelectItem>
              {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DataTable rows={rows} columns={columns} pageSize={10} />
      </Panel>
    </div>
  );
}
