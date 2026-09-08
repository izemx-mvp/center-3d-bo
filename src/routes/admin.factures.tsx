import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Receipt, Search, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { KpiCard, PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { DataTable, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-state";
import { formatDate, formatMAD, type Invoice } from "@/lib/data";

export const Route = createFileRoute("/admin/factures")({
  head: () => ({
    meta: [
      { title: "Factures — CENTRE 3D" },
      { name: "description", content: "Facturation complète : montants HT, TVA, TTC, échéances et relances des factures en retard." },
      { property: "og:title", content: "Factures — CENTRE 3D" },
      { property: "og:description", content: "Gestion de la facturation et du recouvrement client." },
    ],
  }),
  component: InvoicesPage,
});

const ALL = "__all__";

function InvoicesPage() {
  const { invoices } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ALL);
  const [selected, setSelected] = useState<Invoice | null>(null);

  const rows = useMemo(
    () =>
      invoices.filter(
        (i) =>
          (!q || `${i.id} ${i.orderId} ${i.clientName} ${i.company}`.toLowerCase().includes(q.toLowerCase())) &&
          (status === ALL || i.status === status),
      ),
    [invoices, q, status],
  );

  const late = invoices.filter((i) => i.status === "En retard");

  const columns: Column<Invoice>[] = [
    { key: "id", header: "Facture", sortValue: (i) => i.id, render: (i) => <span className="font-mono text-xs">{i.id}</span> },
    { key: "order", header: "Commande", sortValue: (i) => i.orderId, render: (i) => <span className="font-mono text-xs">{i.orderId}</span> },
    {
      key: "client",
      header: "Client",
      sortValue: (i) => i.clientName,
      render: (i) => (<div><p className="font-medium">{i.clientName}</p><p className="text-xs text-muted-foreground">{i.company}</p></div>),
    },
    { key: "ht", header: "Montant HT", sortValue: (i) => i.amountHT, render: (i) => formatMAD(i.amountHT) },
    { key: "ttc", header: "Montant TTC", sortValue: (i) => i.amountTTC, render: (i) => <span className="font-medium text-primary">{formatMAD(i.amountTTC)}</span> },
    { key: "due", header: "Échéance", sortValue: (i) => i.dueDate, render: (i) => formatDate(i.dueDate) },
    { key: "status", header: "Statut", sortValue: (i) => i.status, render: (i) => <StatusPill status={i.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factures"
        subtitle={`${rows.length} factures émises`}
        actions={
          <Button size="sm" variant="outline" onClick={() => toast.success("Export comptable généré", { description: "Fichier CSV prêt au téléchargement." })}>
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Factures émises" value={invoices.length} icon={<Receipt className="h-4 w-4" />} delta={9.9} index={0} />
        <KpiCard label="Montant facturé" value={invoices.reduce((s, i) => s + i.amountTTC, 0)} format={formatMAD} icon={<Receipt className="h-4 w-4" />} delta={15.3} index={1} />
        <KpiCard label="Encaissé" value={invoices.filter((i) => i.status === "Payée").reduce((s, i) => s + i.amountTTC, 0)} format={formatMAD} icon={<Receipt className="h-4 w-4" />} delta={11.7} index={2} />
        <KpiCard label="En retard" value={late.reduce((s, i) => s + i.amountTTC, 0)} format={formatMAD} icon={<TriangleAlert className="h-4 w-4" />} delta={-6.5} index={3} />
      </div>

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une facture…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les statuts</SelectItem>
              {["Émise", "Payée", "En retard", "Annulée"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DataTable rows={rows} columns={columns} pageSize={10} onRowClick={setSelected} />
      </Panel>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Facture {selected.id}</SheetTitle>
                <SheetDescription>Émise le {formatDate(selected.date)} · échéance {formatDate(selected.dueDate)}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="font-display text-sm font-semibold">{selected.company}</p>
                  <p className="text-xs text-muted-foreground">{selected.clientName} · commande {selected.orderId}</p>
                </div>
                <dl className="space-y-2 text-sm">
                  {[
                    ["Montant HT", formatMAD(selected.amountHT)],
                    ["TVA (20 %)", formatMAD(selected.vat)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4 border-t border-border pt-3">
                    <dt className="font-display font-semibold">Total TTC</dt>
                    <dd className="font-display text-lg font-bold text-primary">{formatMAD(selected.amountTTC)}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => toast.success("Facture téléchargée (PDF)")}>
                    <Download className="mr-2 h-4 w-4" /> Télécharger le PDF
                  </Button>
                  <Button className="gradient-primary text-primary-foreground" onClick={() => toast.success("Relance envoyée au client")}>
                    Relancer le client
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
