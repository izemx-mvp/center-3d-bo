import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Download, MessageSquare, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/app-state";
import { formatDate, formatMAD, type Quote } from "@/lib/data";

export const Route = createFileRoute("/client/devis")({
  head: () => ({
    meta: [
      { title: "Mes devis — CENTRE 3D" },
      { name: "description", content: "Consultez vos devis machines agricoles, acceptez-les en ligne ou négociez les conditions avec votre conseiller." },
      { property: "og:title", content: "Mes devis — CENTRE 3D" },
      { property: "og:description", content: "Acceptez ou négociez vos devis en quelques clics." },
    ],
  }),
  component: ClientDevis,
});

function ClientDevis() {
  const { quotes, updateQuoteStatus, convertQuoteToOrder } = useApp();
  const [negotiate, setNegotiate] = useState<Quote | null>(null);
  const [note, setNote] = useState("");

  const mine = quotes.slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="Mes devis" subtitle={`${mine.length} devis reçus`} />

      <div className="grid gap-5">
        {mine.map((q) => (
          <Panel key={q.id} padded={false}>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
              <div>
                <p className="font-display text-base font-semibold">Devis {q.id}</p>
                <p className="text-xs text-muted-foreground">Émis le {formatDate(q.createdAt)} · valable jusqu'au {formatDate(q.validUntil)}</p>
              </div>
              <StatusPill status={q.status} />
            </header>
            <div className="grid gap-5 p-4 lg:grid-cols-[1fr_260px]">
              <div>
                <p className="text-sm font-medium">{q.machineName}</p>
                <p className="text-xs text-muted-foreground">Quantité : {q.quantity} · PU HT {formatMAD(q.unitPrice)} · remise {q.discount} %</p>
                <p className="mt-3 text-sm text-muted-foreground">Conditions de paiement : {q.paymentTerms}</p>
                <p className="text-sm text-muted-foreground">Conseiller : {q.rep}</p>
              </div>
              <dl className="space-y-2 rounded-lg bg-surface p-4 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total HT</dt><dd>{formatMAD(q.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">TVA {q.vat} %</dt><dd>{formatMAD(q.total - q.subtotal)}</dd></div>
                <div className="flex justify-between border-t border-border pt-2"><dt className="font-semibold">Total TTC</dt><dd className="font-display text-base font-bold text-primary">{formatMAD(q.total)}</dd></div>
              </dl>
            </div>
            <footer className="flex flex-wrap gap-2 border-t border-border p-4">
              <Button size="sm" variant="outline" onClick={() => toast.success("Devis téléchargé (PDF)")}>
                <Download className="mr-2 h-4 w-4" /> Télécharger
              </Button>
              <Button size="sm" variant="outline" onClick={() => setNegotiate(q)}>
                <MessageSquare className="mr-2 h-4 w-4" /> Négocier
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { updateQuoteStatus(q.id, "Refusé"); toast.info("Devis refusé"); }}>
                <XCircle className="mr-2 h-4 w-4" /> Refuser
              </Button>
              <Button
                size="sm"
                className="ml-auto gradient-primary text-primary-foreground"
                onClick={() => {
                  const order = convertQuoteToOrder(q.id);
                  toast.success("Devis accepté", { description: order ? `Votre commande ${order.id} est confirmée.` : undefined });
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Accepter et commander
              </Button>
            </footer>
          </Panel>
        ))}
      </div>

      <Dialog open={!!negotiate} onOpenChange={(o) => !o && setNegotiate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Négocier le devis {negotiate?.id}</DialogTitle>
            <DialogDescription>Indiquez vos attentes : prix, délais, conditions de paiement ou livraison.</DialogDescription>
          </DialogHeader>
          <Textarea rows={5} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nous souhaiterions une remise supplémentaire pour une commande de 2 unités…" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNegotiate(null)}>Annuler</Button>
            <Button
              className="gradient-primary text-primary-foreground"
              onClick={() => {
                if (negotiate) updateQuoteStatus(negotiate.id, "En négociation");
                setNegotiate(null);
                setNote("");
                toast.success("Message envoyé à votre conseiller");
              }}
            >
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
