import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, PackageCheck, PackageX, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { KpiCard, PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { DataTable, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, CITIES, formatMAD, machines, type Machine } from "@/lib/data";

export const Route = createFileRoute("/admin/disponibilite")({
  head: () => ({
    meta: [
      { title: "Disponibilité & stock — CENTRE 3D" },
      { name: "description", content: "Pilotage de la disponibilité des machines : stock par ville, réservations, alertes de rupture et délais de réapprovisionnement." },
      { property: "og:title", content: "Disponibilité & stock — CENTRE 3D" },
      { property: "og:description", content: "Stock temps réel des machines agricoles par dépôt et par catégorie." },
    ],
  }),
  component: AvailabilityPage,
});

const ALL = "__all__";

function AvailabilityPage() {
  const [cat, setCat] = useState(ALL);
  const [city, setCity] = useState(ALL);

  const rows = useMemo(
    () => machines.filter((m) => (cat === ALL || m.category === cat) && (city === ALL || m.city === city)),
    [cat, city],
  );

  const available = rows.filter((m) => m.availability === "Disponible").length;
  const reserved = rows.filter((m) => m.availability === "Réservée").length;
  const out = rows.filter((m) => m.availability === "Indisponible").length;
  const lowStock = rows.filter((m) => m.stock <= 1);

  const byCity = CITIES.map((c) => ({
    city: c,
    total: machines.filter((m) => m.city === c).length,
    dispo: machines.filter((m) => m.city === c && m.availability === "Disponible").length,
  })).filter((c) => c.total > 0);

  const columns: Column<Machine>[] = [
    {
      key: "machine",
      header: "Machine",
      sortValue: (m) => m.name,
      render: (m) => (
        <Link to="/admin/catalogue/$id" params={{ id: m.id }} className="flex items-center gap-3">
          <img src={m.image} alt={m.name} loading="lazy" width={200} height={150} className="h-10 w-14 rounded object-cover" />
          <span className="min-w-0">
            <span className="block truncate font-medium">{m.name}</span>
            <span className="block text-xs text-muted-foreground">{m.brand} · {m.category}</span>
          </span>
        </Link>
      ),
    },
    { key: "city", header: "Dépôt", sortValue: (m) => m.city, render: (m) => `${m.city}, ${m.country}` },
    { key: "stock", header: "Stock", sortValue: (m) => m.stock, render: (m) => <span className={m.stock <= 1 ? "font-semibold text-warning" : "font-medium"}>{m.stock}</span> },
    { key: "av", header: "Disponibilité", sortValue: (m) => m.availability, render: (m) => <StatusPill status={m.availability} /> },
    { key: "price", header: "Prix", sortValue: (m) => m.price, render: (m) => formatMAD(m.price) },
    {
      key: "act",
      header: "",
      render: (m) => (
        <Button size="sm" variant="outline" onClick={() => toast.success("Réapprovisionnement demandé", { description: `${m.name} — commande fournisseur créée.` })}>
          Réapprovisionner
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Disponibilité & stock" subtitle={`${rows.length} références suivies en temps réel`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Disponibles" value={available} icon={<PackageCheck className="h-4 w-4" />} delta={4.1} index={0} />
        <KpiCard label="Réservées" value={reserved} icon={<Warehouse className="h-4 w-4" />} delta={1.8} index={1} />
        <KpiCard label="Indisponibles" value={out} icon={<PackageX className="h-4 w-4" />} delta={-2.4} index={2} />
        <KpiCard label="Stock critique" value={lowStock.length} icon={<AlertTriangle className="h-4 w-4" />} hint="≤ 1 unité" index={3} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel padded={false}>
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Toutes catégories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder="Dépôt" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Tous les dépôts</SelectItem>
                {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DataTable rows={rows} columns={columns} pageSize={8} />
        </Panel>

        <div className="space-y-5">
          <Panel title="Répartition par dépôt">
            <ul className="space-y-3">
              {byCity.map((c) => (
                <li key={c.city}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{c.city}</span>
                    <span className="text-muted-foreground">{c.dispo}/{c.total}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[image:var(--gradient-primary)]" style={{ width: `${(c.dispo / c.total) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Alertes de rupture" description="Machines à réapprovisionner en priorité">
            <ul className="space-y-3">
              {lowStock.slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-center gap-3 rounded-lg border border-warning/25 bg-warning/[0.06] p-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{m.name}</span>
                    <span className="block text-xs text-muted-foreground">{m.city} · {m.stock} unité(s)</span>
                  </span>
                </li>
              ))}
              {lowStock.length === 0 && <li className="text-sm text-muted-foreground">Aucune alerte en cours.</li>}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
