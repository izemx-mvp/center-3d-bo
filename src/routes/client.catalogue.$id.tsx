import { useState } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Heart, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-state";
import { CITIES, formatMAD, machineById, machines } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/client/catalogue/$id")({
  head: () => ({
    meta: [
      { title: "Détail machine — Espace client CENTRE 3D" },
      { name: "description", content: "Fiche complète de la machine : caractéristiques techniques, disponibilité, prix et demande de devis en ligne." },
      { property: "og:title", content: "Détail machine agricole — CENTRE 3D" },
      { property: "og:description", content: "Consultez les caractéristiques et demandez votre devis personnalisé." },
    ],
  }),
  component: ClientMachineDetail,
});

function ClientMachineDetail() {
  const { id } = useParams({ from: "/client/catalogue/$id" });
  const { favorites, toggleFavorite, createDemande } = useApp();
  const navigate = useNavigate();
  const machine = machineById(id);
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [city, setCity] = useState<string>(CITIES[0] ?? "Rabat");
  const [message, setMessage] = useState("");

  if (!machine) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="font-display text-lg font-semibold">Machine introuvable</p>
        <Button variant="outline" className="mt-4" asChild><Link to="/client/catalogue">Retour au catalogue</Link></Button>
      </div>
    );
  }

  const similar = machines.filter((m) => m.category === machine.category && m.id !== machine.id).slice(0, 3);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/client/catalogue"><ArrowLeft className="mr-2 h-4 w-4" /> Retour au catalogue</Link>
      </Button>

      <PageHeader
        title={machine.name}
        subtitle={`${machine.category} · ${machine.brand} ${machine.model} · ${machine.year}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toggleFavorite(machine.id)}>
              <Heart className={cn("mr-2 h-4 w-4", favorites.includes(machine.id) && "fill-destructive text-destructive")} />
              {favorites.includes(machine.id) ? "Retiré des favoris" : "Ajouter aux favoris"}
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow" onClick={() => setOpen(true)}>
              Demander un devis
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <img src={machine.image} alt={machine.name} width={1024} height={768} className="aspect-[4/3] w-full rounded-xl border border-border object-cover shadow-soft" />
          <Panel title="Description">
            <p className="text-sm leading-relaxed text-muted-foreground">{machine.description}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {machine.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> {f}</li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-3xl font-bold text-primary">{formatMAD(machine.price)}</p>
                <p className="text-xs text-muted-foreground">Prix HT · TVA {machine.vat} %</p>
              </div>
              <StatusPill status={machine.availability} />
            </div>
            <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
              {[["Puissance", machine.power], ["Capacité", machine.capacity], ["Dimensions", machine.dimensions], ["Poids", machine.weight], ["Année", String(machine.year)]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-4 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" /> Disponible à {machine.city}, {machine.country}
            </p>
            <Button className="mt-5 w-full gradient-primary text-primary-foreground" onClick={() => setOpen(true)}>
              Demander un devis personnalisé
            </Button>
          </Panel>

          <Panel title="Machines similaires">
            <ul className="space-y-3">
              {similar.map((m) => (
                <li key={m.id}>
                  <Link to="/client/catalogue/$id" params={{ id: m.id }} className="flex items-center gap-3 rounded-lg border border-border p-2 transition-colors hover:bg-accent/60">
                    <img src={m.image} alt={m.name} loading="lazy" width={200} height={150} className="h-12 w-16 rounded object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{m.name}</span>
                      <span className="block text-xs text-primary">{formatMAD(m.price)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande de devis</DialogTitle>
            <DialogDescription>{machine.name} — réponse d'un conseiller sous 24 h ouvrées.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              createDemande({ machineId: machine.id, quantity, city, message, budget: machine.price * quantity });
              setOpen(false);
              toast.success("Demande envoyée", { description: "Votre conseiller vous répond sous 24 h." });
              navigate({ to: "/client/demandes" });
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="qty">Quantité</Label>
                <Input id="qty" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />
              </div>
              <div className="space-y-2">
                <Label>Ville de livraison</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="msg">Message</Label>
              <Textarea id="msg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Précisez vos besoins, délais et conditions souhaitées…" />
            </div>
            <p className="rounded-lg bg-surface p-3 text-sm">
              Budget estimé : <span className="font-semibold text-primary">{formatMAD(machine.price * quantity)}</span> HT
            </p>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">Envoyer la demande</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
