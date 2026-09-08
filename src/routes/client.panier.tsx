import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CreditCard, FileText, Landmark, Lock, Minus, Plus, ShieldCheck, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-state";
import { CITIES, formatMAD, type Payment } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/client/panier")({
  head: () => ({
    meta: [
      { title: "Mon panier — Espace client CENTRE 3D" },
      { name: "description", content: "Regroupez plusieurs machines agricoles, demandez un devis groupé ou payez en ligne en toute sécurité." },
      { property: "og:title", content: "Mon panier — CENTRE 3D" },
      { property: "og:description", content: "Devis groupé ou paiement en ligne pour vos machines agricoles." },
    ],
  }),
  component: ClientPanier,
});

type Method = Payment["method"];

function ClientPanier() {
  const { cart, catalogue, setCartQuantity, removeFromCart, clearCart, submitCartDemande, checkoutCart } = useApp();
  const navigate = useNavigate();
  const [city, setCity] = useState<string>(CITIES[0] ?? "Rabat");
  const [message, setMessage] = useState("");
  const [devisOpen, setDevisOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState<Method>("Carte bancaire");
  const [card, setCard] = useState({ holder: "Ahmed Benali", number: "", expiry: "", cvc: "" });
  const [processing, setProcessing] = useState(false);

  const lines = useMemo(
    () =>
      cart
        .map((l) => ({ line: l, machine: catalogue.find((m) => m.id === l.machineId) }))
        .filter((x): x is { line: (typeof cart)[number]; machine: NonNullable<typeof x.machine> } => !!x.machine),
    [cart, catalogue],
  );

  const totals = useMemo(() => {
    const ht = lines.reduce((s, { line, machine }) => s + machine.price * line.quantity, 0);
    const tva = lines.reduce((s, { line, machine }) => s + (machine.price * line.quantity * machine.vat) / 100, 0);
    return { ht, tva, ttc: ht + tva, units: lines.reduce((s, { line }) => s + line.quantity, 0) };
  }, [lines]);

  const cardValid = method !== "Carte bancaire" || (card.number.replace(/\s/g, "").length >= 12 && card.expiry.length >= 4 && card.cvc.length >= 3);

  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      const result = checkoutCart({ city, method });
      setProcessing(false);
      setPayOpen(false);
      toast.success("Paiement confirmé", {
        description: `${result.orders.length} commande(s) réglée(s) pour ${formatMAD(result.total)} TTC. Vos factures sont disponibles.`,
      });
      navigate({ to: "/client/commandes" });
    }, 1400);
  };

  if (lines.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Mon panier" subtitle="Aucune machine dans votre panier" />
        <EmptyState
          title="Votre panier est vide"
          description="Ajoutez des machines depuis le catalogue pour demander un devis groupé ou commander en ligne."
          actionLabel="Parcourir le catalogue"
          onAction={() => navigate({ to: "/client/catalogue" })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/client/catalogue"><ArrowLeft className="mr-2 h-4 w-4" /> Continuer mes achats</Link>
      </Button>

      <PageHeader
        title="Mon panier"
        subtitle={`${lines.length} référence(s) · ${totals.units} unité(s)`}
        actions={
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { clearCart(); toast.info("Panier vidé"); }}>
            <Trash2 className="mr-2 h-4 w-4" /> Vider le panier
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {lines.map(({ line, machine }, i) => (
            <div key={machine.id} className="animate-rise-in" style={{ animationDelay: `${i * 60}ms` }}>
            <Panel padded={false}>
              <div className="flex flex-wrap items-center gap-4 p-4">
                <Link to="/client/catalogue/$id" params={{ id: machine.id }} className="shrink-0">
                  <img src={machine.image} alt={machine.name} loading="lazy" width={200} height={150} className="h-24 w-32 rounded-lg object-cover" />
                </Link>
                <div className="min-w-[200px] flex-1">
                  <Link to="/client/catalogue/$id" params={{ id: machine.id }} className="font-display text-base font-semibold hover:text-primary">
                    {machine.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{machine.brand} {machine.model} · {machine.category} · {machine.city}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusPill status={machine.availability} />
                    <Badge variant="secondary">Stock : {machine.stock}</Badge>
                    <span className="text-xs text-muted-foreground">PU HT {formatMAD(machine.price)} · TVA {machine.vat} %</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border p-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Diminuer" onClick={() => setCartQuantity(machine.id, line.quantity - 1)} disabled={line.quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => setCartQuantity(machine.id, Math.max(1, Number(e.target.value) || 1))}
                    className="h-8 w-14 border-0 text-center shadow-none focus-visible:ring-0"
                    aria-label="Quantité"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Augmenter" onClick={() => setCartQuantity(machine.id, line.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-display text-lg font-bold text-primary">{formatMAD(machine.price * line.quantity)}</span>
                  <button onClick={() => removeFromCart(machine.id)} className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> Retirer
                  </button>
                </div>
              </div>
              {line.quantity > machine.stock && (
                <p className="border-t border-border bg-warning/10 px-4 py-2 text-xs text-warning-foreground">
                  Quantité supérieure au stock disponible ({machine.stock}) — le complément sera livré sous {machine.availability === "Prochainement" ? "6 à 8" : "4 à 6"} semaines.
                </p>
              )}
            </Panel>
            </div>
          ))}
        </div>

        <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <Panel title="Livraison">
            <div className="space-y-2">
              <Label>Ville de livraison</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <p className="flex items-center gap-2 pt-1 text-xs text-muted-foreground"><Truck className="h-3.5 w-3.5 text-primary" /> Livraison et mise en service incluses au Maroc.</p>
            </div>
          </Panel>

          <Panel title="Récapitulatif">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total HT</dt><dd>{formatMAD(totals.ht)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">TVA</dt><dd>{formatMAD(totals.tva)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Livraison</dt><dd className="text-primary">Offerte</dd></div>
              <div className="flex justify-between border-t border-border pt-3"><dt className="font-semibold">Total TTC</dt><dd className="font-display text-xl font-bold text-primary">{formatMAD(totals.ttc)}</dd></div>
            </dl>
            <div className="mt-5 space-y-2">
              <Button className="w-full gradient-primary text-primary-foreground shadow-glow" size="lg" onClick={() => setPayOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" /> Payer en ligne
              </Button>
              <Button variant="outline" className="w-full" size="lg" onClick={() => setDevisOpen(true)}>
                <FileText className="mr-2 h-4 w-4" /> Demander un devis groupé
              </Button>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              Paiement sécurisé. Vous préférez négocier ? La demande de devis vous met en relation avec votre conseiller sous 24 h.
            </p>
          </Panel>
        </div>
      </div>

      {/* Demande de devis groupée */}
      <Dialog open={devisOpen} onOpenChange={setDevisOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande de devis groupée</DialogTitle>
            <DialogDescription>{lines.length} référence(s) · budget estimé {formatMAD(totals.ht)} HT. Un conseiller vous répond sous 24 h ouvrées.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const created = submitCartDemande({ city, message });
              setDevisOpen(false);
              toast.success("Demande envoyée", { description: `${created.length} demande(s) transmise(s) à votre conseiller.` });
              navigate({ to: "/client/demandes" });
            }}
          >
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg bg-surface p-3 text-sm">
              {lines.map(({ line, machine }) => (
                <li key={machine.id} className="flex justify-between gap-3"><span className="truncate">{machine.name}</span><span className="shrink-0 text-muted-foreground">× {line.quantity}</span></li>
              ))}
            </ul>
            <div className="space-y-2">
              <Label htmlFor="cart-msg">Message au conseiller</Label>
              <Textarea id="cart-msg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Délais souhaités, financement, remise volume, reprise d'ancien matériel…" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDevisOpen(false)}>Annuler</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">Envoyer la demande</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Paiement en ligne */}
      <Dialog open={payOpen} onOpenChange={(o) => !processing && setPayOpen(o)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Paiement en ligne</DialogTitle>
            <DialogDescription>Montant à régler : <span className="font-semibold text-primary">{formatMAD(totals.ttc)}</span> TTC · livraison à {city}.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { m: "Carte bancaire" as const, icon: CreditCard, hint: "Visa · Mastercard · CMI" },
                { m: "Virement bancaire" as const, icon: Landmark, hint: "RIB transmis par e-mail" },
                { m: "Leasing" as const, icon: FileText, hint: "Étude sous 48 h" },
              ]
            ).map(({ m, icon: Icon, hint }) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  method === m ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/40",
                )}
              >
                <Icon className={cn("h-5 w-5", method === m ? "text-primary" : "text-muted-foreground")} />
                <p className="mt-2 text-xs font-semibold">{m}</p>
                <p className="text-[11px] text-muted-foreground">{hint}</p>
              </button>
            ))}
          </div>

          {method === "Carte bancaire" ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="holder">Titulaire</Label>
                <Input id="holder" value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cardno">Numéro de carte</Label>
                <Input
                  id="cardno"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d]/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="exp">Expiration</Label>
                  <Input id="exp" placeholder="MM/AA" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value.replace(/[^\d]/g, "").slice(0, 4).replace(/(\d{2})(?=\d)/, "$1/") })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" inputMode="numeric" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/[^\d]/g, "").slice(0, 4) })} />
                </div>
              </div>
            </div>
          ) : method === "Virement bancaire" ? (
            <div className="rounded-lg bg-surface p-4 text-sm">
              <p className="font-medium">Coordonnées bancaires CENTRE 3D</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">IBAN MA64 0111 5190 0000 1234 5678 9012 · BIC BCMAMAMC</p>
              <p className="mt-2 text-xs text-muted-foreground">Votre commande est confirmée immédiatement et validée à réception du virement.</p>
            </div>
          ) : (
            <div className="rounded-lg bg-surface p-4 text-sm">
              <p className="font-medium">Financement en leasing</p>
              <p className="mt-1 text-xs text-muted-foreground">Mensualité indicative : <span className="font-semibold text-primary">{formatMAD(totals.ttc / 48)}</span> / mois sur 48 mois. Dossier étudié par notre partenaire sous 48 h.</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayOpen(false)} disabled={processing}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={pay} disabled={!cardValid || processing}>
              <Lock className="mr-2 h-4 w-4" /> {processing ? "Traitement…" : `Payer ${formatMAD(totals.ttc)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
