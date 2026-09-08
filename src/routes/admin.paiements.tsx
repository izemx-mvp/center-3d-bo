import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Banknote, CreditCard, Search, Wallet } from "lucide-react";
import { KpiCard, PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { DataTable, type Column } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-state";
import { formatDate, formatMAD, type Payment } from "@/lib/data";

export const Route = createFileRoute("/admin/paiements")({
  head: () => ({
    meta: [
      { title: "Paiements — CENTRE 3D" },
      { name: "description", content: "Encaissements et suivi des paiements : virements, chèques, cartes bancaires et leasing." },
      { property: "og:title", content: "Paiements — CENTRE 3D" },
      { property: "og:description", content: "Suivi des encaissements et des méthodes de paiement client." },
    ],
  }),
  component: PaymentsPage,
});

const ALL = "__all__";

function PaymentsPage() {
  const { payments } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ALL);
  const [method, setMethod] = useState(ALL);

  const rows = useMemo(
    () =>
      payments.filter(
        (p) =>
          (!q || `${p.id} ${p.orderId} ${p.clientName} ${p.company}`.toLowerCase().includes(q.toLowerCase())) &&
          (status === ALL || p.status === status) &&
          (method === ALL || p.method === method),
      ),
    [payments, q, status, method],
  );

  const collected = payments.filter((p) => p.status === "Payé").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "En attente" || p.status === "Initié").reduce((s, p) => s + p.amount, 0);

  const columns: Column<Payment>[] = [
    { key: "id", header: "Paiement", sortValue: (p) => p.id, render: (p) => <span className="font-mono text-xs">{p.id}</span> },
    { key: "order", header: "Commande", sortValue: (p) => p.orderId, render: (p) => <span className="font-mono text-xs">{p.orderId}</span> },
    {
      key: "client",
      header: "Client",
      sortValue: (p) => p.clientName,
      render: (p) => (<div><p className="font-medium">{p.clientName}</p><p className="text-xs text-muted-foreground">{p.company}</p></div>),
    },
    { key: "amount", header: "Montant", sortValue: (p) => p.amount, render: (p) => <span className="font-medium text-primary">{formatMAD(p.amount)}</span> },
    { key: "method", header: "Méthode", sortValue: (p) => p.method, render: (p) => <Badge variant="secondary">{p.method}</Badge> },
    { key: "status", header: "Statut", sortValue: (p) => p.status, render: (p) => <StatusPill status={p.status} /> },
    { key: "date", header: "Date", sortValue: (p) => p.date, render: (p) => formatDate(p.date) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Paiements" subtitle={`${rows.length} transactions`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Encaissé" value={collected} format={formatMAD} icon={<Wallet className="h-4 w-4" />} delta={13.6} index={0} />
        <KpiCard label="En attente" value={pending} format={formatMAD} icon={<Banknote className="h-4 w-4" />} delta={-4.2} index={1} />
        <KpiCard label="Transactions" value={payments.length} icon={<CreditCard className="h-4 w-4" />} delta={7.8} index={2} />
        <KpiCard
          label="Ticket moyen"
          value={payments.length ? payments.reduce((s, p) => s + p.amount, 0) / payments.length : 0}
          format={formatMAD}
          icon={<CreditCard className="h-4 w-4" />}
          delta={2.1}
          index={3}
        />
      </div>

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un paiement…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les statuts</SelectItem>
              {["En attente", "Initié", "Payé", "Échoué", "Remboursé"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Méthode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes méthodes</SelectItem>
              {["Virement bancaire", "Chèque", "Carte bancaire", "Leasing"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DataTable rows={rows} columns={columns} pageSize={10} />
      </Panel>
    </div>
  );
}
