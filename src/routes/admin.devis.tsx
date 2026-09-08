import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Eye, FileText, Percent, Save, Search, Send } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { QuoteDownloadButton, QuotePreviewDialog } from "@/components/QuotePreview";
import { useApp } from "@/lib/app-state";
import { formatDate, formatMAD, type Quote } from "@/lib/data";
import { quoteTotals } from "@/lib/quote-doc";

export const Route = createFileRoute("/admin/devis")({
  head: () => ({
    meta: [
      { title: "Devis — CENTRE 3D" },
      { name: "description", content: "Création, suivi et conversion des devis : remises, TVA, validité et transformation en commande." },
      { property: "og:title", content: "Devis commerciaux — CENTRE 3D" },
      { property: "og:description", content: "Pilotez le cycle de vie complet de vos devis machines agricoles." },
    ],
  }),
  component: DevisPage,
});

const ALL = "__all__";

function DevisPage() {
  const { quotes, updateQuoteStatus, convertQuoteToOrder, updateQuotePricing } = useApp();
  const [preview, setPreview] = useState<Quote | null>(null);
  const [draft, setDraft] = useState<{ unitPrice: number; quantity: number; discount: number; delivery: number; vat: number; paymentTerms: string } | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ALL);
  const [selected, setSelected] = useState<Quote | null>(null);

  const rows = useMemo(
    () =>
      quotes.filter(
        (d) =>
          (!q || `${d.id} ${d.clientName} ${d.company} ${d.machineName}`.toLowerCase().includes(q.toLowerCase())) &&
          (status === ALL || d.status === status),
      ),
    [quotes, q, status],
  );

  const accepted = quotes.filter((d) => d.status === "Accepté");
  const rate = quotes.length ? (accepted.length / quotes.length) * 100 : 0;

  const columns: Column<Quote>[] = [
    { key: "id", header: "Devis", sortValue: (d) => d.id, render: (d) => <span className="font-mono text-xs">{d.id}</span> },
    {
      key: "client",
      header: "Client",
      sortValue: (d) => d.clientName,
      render: (d) => (<div><p className="font-medium">{d.clientName}</p><p className="text-xs text-muted-foreground">{d.company}</p></div>),
    },
    { key: "machine", header: "Machine", sortValue: (d) => d.machineName, render: (d) => (<div><p className="max-w-[190px] truncate">{d.machineName}</p><p className="text-xs text-muted-foreground">× {d.quantity}</p></div>) },
    { key: "discount", header: "Remise", sortValue: (d) => d.discount, render: (d) => `${d.discount} %` },
    { key: "total", header: "Total TTC", sortValue: (d) => d.total, render: (d) => <span className="font-medium text-primary">{formatMAD(d.total)}</span> },
    { key: "status", header: "Statut", sortValue: (d) => d.status, render: (d) => <StatusPill status={d.status} /> },
    { key: "valid", header: "Valide jusqu'au", sortValue: (d) => d.validUntil, render: (d) => formatDate(d.validUntil) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Devis" subtitle={`${rows.length} devis · ${accepted.length} acceptés`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Devis émis" value={quotes.length} icon={<FileText className="h-4 w-4" />} delta={8.7} index={0} />
        <KpiCard label="Montant total" value={quotes.reduce((s, d) => s + d.total, 0)} format={formatMAD} icon={<FileText className="h-4 w-4" />} delta={14.2} index={1} />
        <KpiCard label="Taux d'acceptation" value={rate} format={(n) => `${n.toFixed(1)} %`} icon={<Percent className="h-4 w-4" />} delta={2.9} index={2} />
        <KpiCard label="En négociation" value={quotes.filter((d) => d.status === "En négociation").length} icon={<Send className="h-4 w-4" />} delta={-1.3} index={3} />
      </div>

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un devis…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les statuts</SelectItem>
              {["Brouillon", "Envoyé", "En négociation", "Accepté", "Refusé", "Expiré"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DataTable rows={rows} columns={columns} pageSize={10} onRowClick={(d) => {
            setSelected(d);
            setDraft({ unitPrice: d.unitPrice, quantity: d.quantity, discount: d.discount, delivery: d.delivery, vat: d.vat, paymentTerms: d.paymentTerms });
          }} />
      </Panel>

      <QuotePreviewDialog quote={preview} onOpenChange={(o) => !o && setPreview(null)} />

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Devis {selected.id}</SheetTitle>
                <SheetDescription>
                  Émis le {formatDate(selected.createdAt)} · valable jusqu'au {formatDate(selected.validUntil)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="font-display text-sm font-semibold">{selected.company}</p>
                  <p className="text-xs text-muted-foreground">{selected.clientName} · commercial : {selected.rep}</p>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
                      <th className="pb-2">Désignation</th>
                      <th className="pb-2 text-right">Qté</th>
                      <th className="pb-2 text-right">PU HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-3">{selected.machineName}</td>
                      <td className="py-3 text-right">{selected.quantity}</td>
                      <td className="py-3 text-right">{formatMAD(selected.unitPrice)}</td>
                    </tr>
                  </tbody>
                </table>

                <dl className="space-y-2 text-sm">
                  {[
                    ["Remise commerciale", `${selected.discount} %`],
                    ["Livraison", formatMAD(selected.delivery)],
                    ["Sous-total HT", formatMAD(selected.subtotal)],
                    [`TVA (${selected.vat} %)`, formatMAD(selected.total - selected.subtotal)],
                    ["Conditions de paiement", selected.paymentTerms],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4 border-t border-border pt-3">
                    <dt className="font-display font-semibold">Total TTC</dt>
                    <dd className="font-display text-lg font-bold text-primary">{formatMAD(selected.total)}</dd>
                  </div>
                </dl>

                {draft && (
                  <div className="space-y-3 rounded-lg border border-primary/25 bg-primary/5 p-4">
                    <p className="font-display text-sm font-semibold">Modifier la tarification</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {([
                        ["Prix unitaire HT (MAD)", "unitPrice"],
                        ["Quantité", "quantity"],
                        ["Remise (%)", "discount"],
                        ["Livraison (MAD)", "delivery"],
                        ["TVA (%)", "vat"],
                      ] as const).map(([label, key]) => (
                        <div key={key} className="space-y-1.5">
                          <Label className="text-xs">{label}</Label>
                          <Input
                            type="number"
                            min={0}
                            value={draft[key]}
                            onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) || 0 })}
                          />
                        </div>
                      ))}
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs">Conditions de paiement</Label>
                        <Input value={draft.paymentTerms} onChange={(e) => setDraft({ ...draft, paymentTerms: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-primary/20 pt-3 text-sm">
                      <span className="text-muted-foreground">Nouveau total TTC</span>
                      <span className="font-display text-base font-bold text-primary">{formatMAD(quoteTotals(draft).total)}</span>
                    </div>
                    <Button
                      size="sm"
                      className="gradient-primary text-primary-foreground"
                      onClick={() => {
                        updateQuotePricing(selected.id, draft);
                        const { subtotal, total } = quoteTotals(draft);
                        setSelected({ ...selected, ...draft, subtotal, total });
                        toast.success("Tarification mise à jour", { description: `Nouveau total : ${formatMAD(total)}` });
                      }}
                    >
                      <Save className="mr-2 h-4 w-4" /> Enregistrer les prix
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setPreview(selected)}>
                    <Eye className="mr-2 h-4 w-4" /> Aperçu du devis
                  </Button>
                  <QuoteDownloadButton quote={selected} size="default" />
                  <Button variant="outline" onClick={() => toast.success("Devis envoyé au client")}>
                    <Send className="mr-2 h-4 w-4" /> Envoyer
                  </Button>
                  <Button variant="outline" onClick={() => { updateQuoteStatus(selected.id, "En négociation"); toast.info("Devis passé en négociation"); setSelected(null); }}>
                    Négocier
                  </Button>
                  <Button
                    className="gradient-primary text-primary-foreground"
                    onClick={() => {
                      const order = convertQuoteToOrder(selected.id);
                      toast.success("Commande créée", { description: order ? `Commande ${order.id} générée.` : undefined });
                      setSelected(null);
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Convertir en commande
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
