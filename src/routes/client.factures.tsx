import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Download } from "lucide-react";
import { toast } from "sonner";
import { KpiCard, PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { DataTable, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";
import { formatDate, formatMAD, type Invoice } from "@/lib/data";

export const Route = createFileRoute("/client/factures")({
  head: () => ({
    meta: [
      { title: "Mes factures — CENTRE 3D" },
      { name: "description", content: "Consultez et téléchargez vos factures de machines agricoles, et réglez les montants restant dus en ligne." },
      { property: "og:title", content: "Mes factures — CENTRE 3D" },
      { property: "og:description", content: "Historique de facturation et paiement en ligne." },
    ],
  }),
  component: ClientInvoices,
});

function ClientInvoices() {
  const { invoices } = useApp();
  const mine = invoices.slice(0, 10);
  const due = mine.filter((i) => i.status !== "Payée" && i.status !== "Annulée").reduce((s, i) => s + i.amountTTC, 0);

  const columns: Column<Invoice>[] = [
    { key: "id", header: "Facture", sortValue: (i) => i.id, render: (i) => <span className="font-mono text-xs">{i.id}</span> },
    { key: "order", header: "Commande", sortValue: (i) => i.orderId, render: (i) => <span className="font-mono text-xs">{i.orderId}</span> },
    { key: "date", header: "Date", sortValue: (i) => i.date, render: (i) => formatDate(i.date) },
    { key: "due", header: "Échéance", sortValue: (i) => i.dueDate, render: (i) => formatDate(i.dueDate) },
    { key: "ttc", header: "Montant TTC", sortValue: (i) => i.amountTTC, render: (i) => <span className="font-medium text-primary">{formatMAD(i.amountTTC)}</span> },
    { key: "status", header: "Statut", sortValue: (i) => i.status, render: (i) => <StatusPill status={i.status} /> },
    {
      key: "act",
      header: "",
      render: (i) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => toast.success(`Facture ${i.id} téléchargée`)}>
            <Download className="h-4 w-4" />
          </Button>
          {i.status !== "Payée" && (
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => toast.success("Paiement initié", { description: "Redirection vers le portail bancaire sécurisé." })}>
              Payer
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Mes factures" subtitle={`${mine.length} factures disponibles`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Total facturé" value={mine.reduce((s, i) => s + i.amountTTC, 0)} format={formatMAD} icon={<CreditCard className="h-4 w-4" />} index={0} />
        <KpiCard label="Réglé" value={mine.filter((i) => i.status === "Payée").reduce((s, i) => s + i.amountTTC, 0)} format={formatMAD} icon={<CreditCard className="h-4 w-4" />} index={1} />
        <KpiCard label="Restant dû" value={due} format={formatMAD} icon={<CreditCard className="h-4 w-4" />} index={2} />
      </div>

      <Panel padded={false}>
        <DataTable rows={mine} columns={columns} pageSize={10} />
      </Panel>
    </div>
  );
}
