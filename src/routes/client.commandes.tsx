import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";
import { ORDER_STATUSES, formatDate, formatMAD, machineById } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/client/commandes")({
  head: () => ({
    meta: [
      { title: "Mes commandes — CENTRE 3D" },
      { name: "description", content: "Suivez vos commandes de machines agricoles étape par étape, de la confirmation à la livraison sur votre exploitation." },
      { property: "og:title", content: "Mes commandes — CENTRE 3D" },
      { property: "og:description", content: "Suivi logistique et paiement de vos commandes." },
    ],
  }),
  component: ClientOrders,
});

function ClientOrders() {
  const { orders } = useApp();
  const mine = orders.slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader title="Mes commandes" subtitle={`${mine.length} commandes en cours et passées`} />

      <div className="grid gap-5">
        {mine.map((o) => {
          const m = machineById(o.machineId);
          const currentIndex = ORDER_STATUSES.indexOf(o.status);
          return (
            <Panel key={o.id} padded={false}>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
                <div className="flex items-center gap-4">
                  {m && <img src={m.image} alt={m.name} loading="lazy" width={200} height={150} className="h-16 w-24 rounded-lg object-cover" />}
                  <div>
                    <p className="font-display text-base font-semibold">{o.machineName}</p>
                    <p className="text-xs text-muted-foreground">{o.id} · {formatDate(o.createdAt)} · livraison à {o.deliveryCity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusPill status={o.status} />
                  <p className="mt-1 font-display text-base font-bold text-primary">{formatMAD(o.total)}</p>
                </div>
              </header>

              <div className="p-4">
                <ol className="flex flex-wrap gap-x-2 gap-y-3">
                  {ORDER_STATUSES.slice(0, 7).map((s, i) => {
                    const done = i <= currentIndex;
                    return (
                      <li key={s} className="flex flex-1 items-center gap-2">
                        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold", done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>
                          {i + 1}
                        </span>
                        <span className={cn("whitespace-nowrap text-xs", done ? "font-medium" : "text-muted-foreground")}>{s}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <footer className="flex flex-wrap gap-2 border-t border-border p-4">
                <Button size="sm" variant="outline" onClick={() => toast.info("Suivi logistique", { description: `Livraison prévue à ${o.deliveryCity}.` })}>
                  Suivre la livraison
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toast.success("Votre conseiller a été contacté")}>
                  Contacter mon conseiller
                </Button>
              </footer>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
