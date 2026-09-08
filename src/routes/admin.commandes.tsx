import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PackageSearch, Search, ShoppingCart, Truck } from "lucide-react";
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
import { ORDER_STATUSES, formatDate, formatMAD, type Order } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/commandes")({
  head: () => ({
    meta: [
      { title: "Commandes — CENTRE 3D" },
      { name: "description", content: "Suivi des commandes machines agricoles : statut logistique, livraison, paiement et facturation." },
      { property: "og:title", content: "Commandes — CENTRE 3D" },
      { property: "og:description", content: "Suivez chaque commande de la confirmation à la livraison." },
    ],
  }),
  component: OrdersPage,
});

const ALL = "__all__";

function OrdersPage() {
  const { orders, updateOrderStatus, registerPayment, generateInvoice } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ALL);
  const [selected, setSelected] = useState<Order | null>(null);

  const rows = useMemo(
    () =>
      orders.filter(
        (o) =>
          (!q || `${o.id} ${o.clientName} ${o.company} ${o.machineName}`.toLowerCase().includes(q.toLowerCase())) &&
          (status === ALL || o.status === status),
      ),
    [orders, q, status],
  );

  const current = selected ? orders.find((o) => o.id === selected.id) ?? selected : null;

  const columns: Column<Order>[] = [
    { key: "id", header: "Commande", sortValue: (o) => o.id, render: (o) => <span className="font-mono text-xs">{o.id}</span> },
    {
      key: "client",
      header: "Client",
      sortValue: (o) => o.clientName,
      render: (o) => (<div><p className="font-medium">{o.clientName}</p><p className="text-xs text-muted-foreground">{o.company}</p></div>),
    },
    { key: "machine", header: "Machine", sortValue: (o) => o.machineName, render: (o) => (<div><p className="max-w-[190px] truncate">{o.machineName}</p><p className="text-xs text-muted-foreground">× {o.quantity}</p></div>) },
    { key: "city", header: "Livraison", sortValue: (o) => o.deliveryCity, render: (o) => o.deliveryCity },
    { key: "total", header: "Montant", sortValue: (o) => o.total, render: (o) => <span className="font-medium text-primary">{formatMAD(o.total)}</span> },
    { key: "status", header: "Statut", sortValue: (o) => o.status, render: (o) => <StatusPill status={o.status} /> },
    { key: "date", header: "Créée le", sortValue: (o) => o.createdAt, render: (o) => formatDate(o.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Commandes" subtitle={`${rows.length} commandes suivies`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Commandes" value={orders.length} icon={<ShoppingCart className="h-4 w-4" />} delta={10.5} index={0} />
        <KpiCard label="Chiffre d'affaires" value={orders.reduce((s, o) => s + o.total, 0)} format={formatMAD} icon={<ShoppingCart className="h-4 w-4" />} delta={16.8} index={1} />
        <KpiCard label="Livrées" value={orders.filter((o) => o.status === "Livrée").length} icon={<Truck className="h-4 w-4" />} delta={5.1} index={2} />
        <KpiCard label="En préparation" value={orders.filter((o) => o.status === "En préparation").length} icon={<PackageSearch className="h-4 w-4" />} delta={-2.2} index={3} />
      </div>

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une commande…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[190px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les statuts</SelectItem>
              {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DataTable rows={rows} columns={columns} pageSize={10} onRowClick={setSelected} />
      </Panel>

      <Sheet open={!!current} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {current && (
            <>
              <SheetHeader>
                <SheetTitle>Commande {current.id}</SheetTitle>
                <SheetDescription>Issue du devis {current.quoteId} · {formatDate(current.createdAt)}</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-6">
                <ol className="space-y-3">
                  {ORDER_STATUSES.map((s, i) => {
                    const currentIndex = ORDER_STATUSES.indexOf(current.status);
                    const done = i <= currentIndex;
                    return (
                      <li key={s} className="flex items-center gap-3">
                        <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold", done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>
                          {i + 1}
                        </span>
                        <span className={cn("text-sm", done ? "font-medium" : "text-muted-foreground")}>{s}</span>
                      </li>
                    );
                  })}
                </ol>

                <dl className="space-y-2.5 text-sm">
                  {[
                    ["Client", current.clientName],
                    ["Société", current.company],
                    ["Machine", `${current.machineName} × ${current.quantity}`],
                    ["Ville de livraison", current.deliveryCity],
                    ["Commercial", current.rep],
                    ["Montant TTC", formatMAD(current.total)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-border pb-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="space-y-3">
                  <Select value={current.status} onValueChange={(v) => { updateOrderStatus(current.id, v as Order["status"]); toast.success(`Statut mis à jour : ${v}`); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => { registerPayment(current.id, current.total); toast.success("Paiement enregistré"); }}>
                      Enregistrer un paiement
                    </Button>
                    <Button className="gradient-primary text-primary-foreground" onClick={() => { const inv = generateInvoice(current.id); toast.success("Facture générée", { description: inv?.id }); }}>
                      Générer la facture
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
