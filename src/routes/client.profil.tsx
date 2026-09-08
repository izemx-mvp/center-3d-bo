import { createFileRoute } from "@tanstack/react-router";
import { Heart, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-state";
import { CITIES, clients, formatMAD, machineById } from "@/lib/data";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/client/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil — CENTRE 3D" },
      { name: "description", content: "Gérez vos informations d'exploitation, vos coordonnées, vos préférences de notification et vos machines favorites." },
      { property: "og:title", content: "Mon profil — CENTRE 3D" },
      { property: "og:description", content: "Coordonnées, préférences et favoris de votre compte client." },
    ],
  }),
  component: ClientProfile,
});

function ClientProfile() {
  const { user, favorites, toggleFavorite } = useApp();
  const client = clients.find((c) => c.id === user?.clientId) ?? clients[0]!;

  return (
    <div className="space-y-6">
      <PageHeader title="Mon profil" subtitle="Informations d'exploitation et préférences" />

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <Panel title="Informations générales">
          <form
            className="space-y-5"
            onSubmit={(e) => { e.preventDefault(); toast.success("Profil mis à jour"); }}
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary/10 text-lg text-primary">{client.initials}</AvatarFallback></Avatar>
              <div>
                <p className="font-display text-lg font-semibold">{client.name}</p>
                <p className="text-sm text-muted-foreground">{client.company} · client depuis {new Date(client.since).getFullYear()}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="n">Nom complet</Label><Input id="n" defaultValue={client.name} /></div>
              <div className="space-y-2"><Label htmlFor="c">Exploitation</Label><Input id="c" defaultValue={client.company} /></div>
              <div className="space-y-2"><Label htmlFor="e">Email</Label><Input id="e" type="email" defaultValue={client.email} /></div>
              <div className="space-y-2"><Label htmlFor="p">Téléphone</Label><Input id="p" defaultValue={client.phone} /></div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Select defaultValue={client.city}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="s">Surface exploitée (ha)</Label><Input id="s" type="number" defaultValue={180} /></div>
            </div>

            <Button type="submit" className="gradient-primary text-primary-foreground">
              <Save className="mr-2 h-4 w-4" /> Enregistrer
            </Button>
          </form>
        </Panel>

        <div className="space-y-5">
          <Panel title="Mon activité">
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between"><span className="text-muted-foreground">Commandes</span><span className="font-medium">{client.orders}</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Montant cumulé</span><span className="font-medium text-primary">{formatMAD(client.totalSpent)}</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Segment</span><span className="font-medium">{client.segment}</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Conseiller</span><span className="font-medium">{client.rep}</span></li>
            </ul>
          </Panel>

          <Panel title="Notifications">
            <ul className="space-y-4 text-sm">
              {[
                ["Nouveaux devis", true],
                ["Suivi de livraison", true],
                ["Rappels de facture", true],
                ["Nouveautés catalogue", false],
              ].map(([label, on]) => (
                <li key={label as string} className="flex items-center justify-between gap-4">
                  <span>{label as string}</span>
                  <Switch defaultChecked={on as boolean} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={`Mes favoris (${favorites.length})`}>
            {favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune machine en favori pour le moment.</p>
            ) : (
              <ul className="space-y-3">
                {favorites.map((id) => {
                  const m = machineById(id);
                  return m ? (
                    <li key={id} className="flex items-center gap-3">
                      <Link to="/client/catalogue/$id" params={{ id }} className="flex min-w-0 flex-1 items-center gap-3">
                        <img src={m.image} alt={m.name} loading="lazy" width={200} height={150} className="h-11 w-14 rounded object-cover" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{m.name}</span>
                          <span className="block text-xs text-primary">{formatMAD(m.price)}</span>
                        </span>
                      </Link>
                      <button onClick={() => toggleFavorite(id)} aria-label="Retirer des favoris">
                        <Heart className="h-4 w-4 fill-destructive text-destructive" />
                      </button>
                    </li>
                  ) : null;
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
