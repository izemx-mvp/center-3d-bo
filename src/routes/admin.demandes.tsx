import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Inbox, Search } from "lucide-react";
import { toast } from "sonner";
import { KpiCard, PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { DataTable, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-state";
import { formatDate, formatMAD, machineById, type DemandeItem } from "@/lib/data";

export const Route = createFileRoute("/admin/demandes")({
  head: () => ({
    meta: [
      { title: "Demandes de devis — CENTRE 3D" },
      { name: "description", content: "Toutes les demandes de devis entrantes : priorité, budget estimé, machine concernée et conversion en devis." },
      { property: "og:title", content: "Demandes de devis — CENTRE 3D" },
      { property: "og:description", content: "Traitez et convertissez les demandes entrantes en devis en un clic." },
    ],
  }),
  component: DemandesPage,
});

const ALL = "__all__";

function DemandesPage() {
  const { demandes } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ALL);
  const [priority, setPriority] = useState(ALL);
  const [selected, setSelected] = useState<DemandeItem | null>(null);

  const rows = useMemo(
    () =>
      demandes.filter(
        (d) =>
          (!q || `${d.clientName} ${d.company} ${d.machineName}`.toLowerCase().includes(q.toLowerCase())) &&
          (status === ALL || d.status === status) &&
          (priority === ALL || d.priority === priority),
      ),
    [demandes, q, status, priority],
  );

  const columns: Column<DemandeItem>[] = [
    { key: "id", header: "Référence", sortValue: (d) => d.id, render: (d) => <span className="font-mono text-xs">{d.id}</span> },
    {
      key: "client",
      header: "Client",
      sortValue: (d) => d.clientName,
      render: (d) => (<div><p className="font-medium">{d.clientName}</p><p className="text-xs text-muted-foreground">{d.company}</p></div>),
    },
    { key: "machine", header: "Machine", sortValue: (d) => d.machineName, render: (d) => (<div><p>{d.machineName}</p><p className="text-xs text-muted-foreground">Quantité : {d.quantity}</p></div>) },
    { key: "city", header: "Ville", sortValue: (d) => d.city, render: (d) => d.city },
    { key: "budget", header: "Budget", sortValue: (d) => d.budget, render: (d) => formatMAD(d.budget) },
    {
      key: "prio",
      header: "Priorité",
      sortValue: (d) => d.priority,
      render: (d) => (
        <Badge variant={d.priority === "Haute" ? "destructive" : d.priority === "Moyenne" ? "default" : "secondary"}>{d.priority}</Badge>
      ),
    },
    { key: "status", header: "Statut", sortValue: (d) => d.status, render: (d) => <StatusPill status={d.status} /> },
    { key: "date", header: "Reçue le", sortValue: (d) => d.createdAt, render: (d) => formatDate(d.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Demandes de devis" subtitle={`${rows.length} demandes entrantes`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total demandes" value={demandes.length} icon={<Inbox className="h-4 w-4" />} delta={9.3} index={0} />
        <KpiCard label="Nouvelles" value={demandes.filter((d) => d.status === "Nouvelle").length} icon={<Inbox className="h-4 w-4" />} delta={4.6} index={1} />
        <KpiCard label="Devis envoyés" value={demandes.filter((d) => d.status === "Devis envoyé").length} icon={<FileText className="h-4 w-4" />} delta={7.2} index={2} />
        <KpiCard label="Budget cumulé" value={demandes.reduce((s, d) => s + d.budget, 0)} format={formatMAD} icon={<FileText className="h-4 w-4" />} delta={11.4} index={3} />
      </div>

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une demande…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les statuts</SelectItem>
              {["Nouvelle", "En cours", "Qualifiée", "Devis envoyé", "Clôturée"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Priorité" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes priorités</SelectItem>
              {["Haute", "Moyenne", "Basse"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DataTable rows={rows} columns={columns} pageSize={10} onRowClick={setSelected} />
      </Panel>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.id}</SheetTitle>
                <SheetDescription>Demande reçue le {formatDate(selected.createdAt)} · {selected.rep}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                {(() => {
                  const m = machineById(selected.machineId);
                  return m ? (
                    <img src={m.image} alt={m.name} width={1024} height={768} className="aspect-video w-full rounded-lg object-cover" />
                  ) : null;
                })()}
                <dl className="space-y-2.5 text-sm">
                  {[
                    ["Client", selected.clientName],
                    ["Société", selected.company],
                    ["Machine", selected.machineName],
                    ["Quantité", String(selected.quantity)],
                    ["Ville de livraison", selected.city],
                    ["Budget estimé", formatMAD(selected.budget)],
                    ["Priorité", selected.priority],
                    ["Statut", selected.status],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-border pb-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="rounded-lg bg-surface p-3 text-sm text-muted-foreground">{selected.message}</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/admin/catalogue/$id" params={{ id: selected.machineId }}>Voir la machine</Link>
                  </Button>
                  <Button
                    className="gradient-primary text-primary-foreground"
                    onClick={() => {
                      toast.success("Devis généré", { description: `Un devis a été créé pour ${selected.clientName}.` });
                      setSelected(null);
                    }}
                  >
                    Générer un devis
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
