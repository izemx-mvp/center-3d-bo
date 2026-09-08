import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/app-state";
import { formatDate, formatMAD, machineById } from "@/lib/data";

export const Route = createFileRoute("/client/demandes")({
  head: () => ({
    meta: [
      { title: "Mes demandes de devis — CENTRE 3D" },
      { name: "description", content: "Suivez l'avancement de vos demandes de devis de machines agricoles et la réponse de votre conseiller." },
      { property: "og:title", content: "Mes demandes de devis — CENTRE 3D" },
      { property: "og:description", content: "Historique et statut de vos demandes de devis." },
    ],
  }),
  component: ClientDemandes,
});

function ClientDemandes() {
  const { demandes } = useApp();
  const [tab, setTab] = useState("all");

  const mine = demandes.slice(0, 12);
  const rows = tab === "all" ? mine : mine.filter((d) => (tab === "open" ? d.status !== "Clôturée" : d.status === "Clôturée"));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes demandes"
        subtitle={`${rows.length} demandes de devis`}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground" asChild><Link to="/client/catalogue">Nouvelle demande</Link></Button>}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="open">En cours</TabsTrigger>
          <TabsTrigger value="closed">Clôturées</TabsTrigger>
        </TabsList>
      </Tabs>

      {rows.length === 0 ? (
        <EmptyState title="Aucune demande" description="Vous n'avez pas encore de demande dans cette catégorie." />
      ) : (
        <div className="grid gap-4">
          {rows.map((d) => {
            const m = machineById(d.machineId);
            return (
              <Panel key={d.id} padded={false}>
                <div className="flex flex-wrap items-center gap-4 p-4">
                  {m && <img src={m.image} alt={m.name} loading="lazy" width={200} height={150} className="h-20 w-28 rounded-lg object-cover" />}
                  <div className="min-w-[200px] flex-1">
                    <p className="font-display text-base font-semibold">{d.machineName}</p>
                    <p className="text-xs text-muted-foreground">{d.id} · envoyée le {formatDate(d.createdAt)} · livraison {d.city}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusPill status={d.status} />
                    <Badge variant="secondary">Quantité : {d.quantity}</Badge>
                    <span className="text-sm font-semibold text-primary">{formatMAD(d.budget)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-border px-4 py-3">
                  <Inbox className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Conseiller assigné : {d.rep}</p>
                  <Button size="sm" variant="ghost" className="ml-auto" asChild>
                    <Link to="/client/catalogue/$id" params={{ id: d.machineId }}>Voir la machine</Link>
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
