import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Receipt,
  ShoppingCart,
  Tractor,
  Wallet,
} from "lucide-react";
import { KpiCard, PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  clientById,
  demandes,
  formatDate,
  formatDateTime,
  formatMAD,
  invoices,
  machineById,
  orders,
  payments,
  quotes,
} from "@/lib/data";

export const Route = createFileRoute("/admin/clients/$id")({
  loader: ({ params }) => {
    const client = clientById(params.id);
    if (!client) throw notFound();
    return { client };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Client introuvable — CENTRE 3D" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.client;
    return {
      meta: [
        { title: `${c.company} — Client 360° — CENTRE 3D` },
        { name: "description", content: `Relation commerciale complète de ${c.company} : demandes, devis, commandes, paiements et factures.` },
        { property: "og:title", content: `${c.company} — Client 360°` },
        { property: "og:description", content: "Vue 360° de la relation client Centre 3D." },
      ],
    };
  },
  component: Client360,
});

type NodeKey = "produits" | "conversations" | "demandes" | "devis" | "commandes" | "paiements" | "factures";

function Client360() {
  const { client } = Route.useLoaderData();
  const [tab, setTab] = useState("apercu");

  const data = useMemo(() => {
    const dem = demandes.filter((d) => d.clientId === client.id);
    const qts = quotes.filter((q) => q.clientId === client.id);
    const ords = orders.filter((o) => o.clientId === client.id);
    const invs = invoices.filter((f) => f.clientId === client.id);
    const pays = payments.filter((p) => ords.some((o) => o.id === p.orderId));
    const machineIds = [...new Set([...dem.map((d) => d.machineId), ...qts.map((q) => q.machineId)])];
    const prods = machineIds.map((id) => machineById(id)).filter((m): m is NonNullable<typeof m> => !!m);
    const billed = invs.reduce((s, f) => s + f.amountTTC, 0);
    const paid = pays.filter((p) => p.status === "Payé").reduce((s, p) => s + p.amount, 0);
    return {
      dem,
      qts,
      ords,
      invs,
      pays,
      prods,
      billed,
      paid,
      outstanding: Math.max(0, billed - paid),
      accepted: qts.filter((q) => q.status === "Accepté").length,
      unpaid: invs.filter((f) => f.status === "En retard" || f.status === "Émise").length,
    };
  }, [client.id]);

  const nodes: { key: NodeKey; label: string; count: number; icon: typeof FileText; angle: number; tab: string }[] = [
    { key: "produits", label: "Produits", count: data.prods.length, icon: Tractor, angle: -90, tab: "produits" },
    { key: "demandes", label: "Demandes", count: data.dem.length, icon: FileText, angle: -38, tab: "demandes" },
    { key: "devis", label: "Devis", count: data.qts.length, icon: FileText, angle: 12, tab: "devis" },
    { key: "commandes", label: "Commandes", count: data.ords.length, icon: ShoppingCart, angle: 63, tab: "commandes" },
    { key: "paiements", label: "Paiements", count: data.pays.length, icon: CreditCard, angle: 115, tab: "paiements" },
    { key: "factures", label: "Factures", count: data.invs.length, icon: Receipt, angle: 168, tab: "factures" },
    { key: "conversations", label: "Conversations", count: 3, icon: MessageSquare, angle: 218, tab: "apercu" },
  ];

  const timeline = useMemo(
    () =>
      [
        ...data.dem.map((d) => ({ at: d.createdAt, text: `Demande ${d.id} — ${d.machineName}` })),
        ...data.qts.map((q) => ({ at: q.createdAt, text: `Devis ${q.id} (${q.status}) — ${formatMAD(q.total)}` })),
        ...data.ords.map((o) => ({ at: o.createdAt, text: `Commande ${o.id} — ${o.status}` })),
        ...data.pays.map((p) => ({ at: p.date, text: `Paiement ${p.id} — ${formatMAD(p.amount)} (${p.status})` })),
        ...data.invs.map((f) => ({ at: f.date, text: `Facture ${f.id} — ${f.status}` })),
      ]
        .sort((a, b) => (a.at < b.at ? 1 : -1))
        .slice(0, 12),
    [data],
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/admin/clients"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux clients</Link>
      </Button>

      <PageHeader title={client.company} subtitle={`Client 360° · ${client.name} · Commercial ${client.rep}`} />

      {/* En-tête client */}
      <Panel>
        <div className="flex flex-wrap items-start gap-6">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-lg font-bold text-primary-foreground shadow-glow">
            {client.initials}
          </span>
          <div className="min-w-[220px] flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold">{client.company}</h2>
              <Badge variant="secondary">{client.segment}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{client.name}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 pt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{client.email}</span>
              <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{client.phone}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{client.city}, {client.country}</span>
              <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />Client depuis {formatDate(client.since)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 text-right">
            <div>
              <p className="text-xs text-muted-foreground">Chiffre d'affaires</p>
              <p className="font-display text-lg font-bold text-primary">{formatMAD(data.billed || client.totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Encours</p>
              <p className="font-display text-lg font-bold text-warning">{formatMAD(data.outstanding)}</p>
            </div>
          </div>
        </div>
      </Panel>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Demandes" value={data.dem.length} icon={<FileText className="h-4 w-4" />} index={0} />
        <KpiCard label="Devis acceptés" value={data.accepted} icon={<FileText className="h-4 w-4" />} index={1} />
        <KpiCard label="Commandes" value={data.ords.length} icon={<ShoppingCart className="h-4 w-4" />} index={2} />
        <KpiCard label="Total payé" value={data.paid} format={formatMAD} icon={<Wallet className="h-4 w-4" />} index={3} />
      </div>

      {/* Écosystème 3D */}
      <Panel
        title="Écosystème du client"
        description="Le client au centre de sa relation commerciale — cliquez un satellite pour ouvrir les données correspondantes."
        padded={false}
      >
        <div className="relative overflow-hidden rounded-b-xl" style={{ perspective: "1100px" }}>
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[90px]" />
          <div
            className="relative mx-auto h-[440px] w-full max-w-[720px]"
            style={{ transform: "rotateX(14deg)", transformStyle: "preserve-3d" }}
          >
            {/* anneaux orbitaux */}
            {[300, 400, 500].map((s, i) => (
              <span
                key={s}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20"
                style={{ width: s, height: s * 0.92, opacity: 0.6 - i * 0.15 }}
              />
            ))}

            {/* lignes de connexion */}
            <svg className="absolute inset-0 h-full w-full text-primary/40" viewBox="0 0 720 440">
              {nodes.map((n) => {
                const rad = (n.angle * Math.PI) / 180;
                return (
                  <line
                    key={n.key}
                    x1={360}
                    y1={220}
                    x2={360 + Math.cos(rad) * 225}
                    y2={220 + Math.sin(rad) * 155}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                );
              })}
            </svg>

            {/* noyau client */}
            <div
              className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border border-primary/30 glass-panel text-center shadow-elevated"
              style={{ transform: "translate(-50%, -50%) translateZ(60px)" }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-xs font-bold text-primary-foreground">
                {client.initials}
              </span>
              <p className="mt-2 line-clamp-2 px-2 text-[11px] font-semibold leading-tight">{client.company}</p>
              <p className="text-[10px] text-muted-foreground">{client.segment}</p>
            </div>

            {/* satellites */}
            {nodes.map((n, i) => {
              const rad = (n.angle * Math.PI) / 180;
              const x = Math.cos(rad) * 235;
              const y = Math.sin(rad) * 160;
              return (
                <div
                  key={n.key}
                  className="absolute left-1/2 top-1/2 animate-fade-in"
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) translateZ(30px)`,
                    animationDelay: `${i * 70}ms`,
                  }}
                >
                  <button
                    onClick={() => setTab(n.tab)}
                    className={cn(
                      "group flex w-[108px] flex-col items-center gap-1 rounded-xl border border-border glass-panel p-2.5 text-center transition-all duration-300",
                      "hover:scale-[1.06] hover:border-primary/50 hover:shadow-glow",
                    )}
                  >
                    <n.icon className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                    <span className="font-display text-base font-bold leading-none">{n.count}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{n.label}</span>
                  </button>
                </div>
              );
            })}

          </div>
        </div>
      </Panel>

      {/* Onglets détaillés */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {[
            ["apercu", "Vue d'ensemble"],
            ["demandes", "Demandes"],
            ["devis", "Devis"],
            ["commandes", "Commandes"],
            ["paiements", "Paiements"],
            ["factures", "Factures"],
            ["produits", "Produits"],
          ].map(([v, l]) => (
            <TabsTrigger key={v} value={v!}>{l}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="apercu" className="mt-4">
          <Panel title="Activité récente" padded={false}>
            <ul className="divide-y divide-border">
              {timeline.length === 0 && <li className="p-4 text-sm text-muted-foreground">Aucune activité enregistrée.</li>}
              {timeline.map((t, i) => (
                <li key={i} className="flex items-start gap-3 p-4">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm">{t.text}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(t.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="demandes" className="mt-4">
          <Panel padded={false}>
            <ul className="divide-y divide-border">
              {data.dem.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">{d.machineName} × {d.quantity}</p>
                    <p className="text-xs text-muted-foreground">{d.id} · {formatDate(d.createdAt)} · {d.city}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary">{formatMAD(d.budget)}</span>
                    <StatusPill status={d.status} />
                  </div>
                </li>
              ))}
              {!data.dem.length && <li className="p-4 text-sm text-muted-foreground">Aucune demande.</li>}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="devis" className="mt-4">
          <Panel padded={false}>
            <ul className="divide-y divide-border">
              {data.qts.map((q) => (
                <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">{q.machineName} × {q.quantity}</p>
                    <p className="text-xs text-muted-foreground">{q.id} · valide jusqu'au {formatDate(q.validUntil)} · remise {q.discount}%</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary">{formatMAD(q.total)}</span>
                    <StatusPill status={q.status} />
                  </div>
                </li>
              ))}
              {!data.qts.length && <li className="p-4 text-sm text-muted-foreground">Aucun devis.</li>}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="commandes" className="mt-4">
          <Panel padded={false}>
            <ul className="divide-y divide-border">
              {data.ords.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">{o.machineName} × {o.quantity}</p>
                    <p className="text-xs text-muted-foreground">{o.id} · devis {o.quoteId} · livraison {o.deliveryCity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary">{formatMAD(o.total)}</span>
                    <StatusPill status={o.status} />
                  </div>
                </li>
              ))}
              {!data.ords.length && <li className="p-4 text-sm text-muted-foreground">Aucune commande.</li>}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="paiements" className="mt-4">
          <Panel padded={false}>
            <ul className="divide-y divide-border">
              {data.pays.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">{formatMAD(p.amount)}</p>
                    <p className="text-xs text-muted-foreground">{p.id} · commande {p.orderId} · {p.method} · {formatDate(p.date)}</p>
                  </div>
                  <StatusPill status={p.status} />
                </li>
              ))}
              {!data.pays.length && <li className="p-4 text-sm text-muted-foreground">Aucun paiement.</li>}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="factures" className="mt-4">
          <Panel padded={false}>
            <ul className="divide-y divide-border">
              {data.invs.map((f) => (
                <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">{formatMAD(f.amountTTC)}</p>
                    <p className="text-xs text-muted-foreground">{f.id} · commande {f.orderId} · échéance {formatDate(f.dueDate)}</p>
                  </div>
                  <StatusPill status={f.status} />
                </li>
              ))}
              {!data.invs.length && <li className="p-4 text-sm text-muted-foreground">Aucune facture.</li>}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="produits" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.prods.map((m) => (
              <Link
                key={m.id}
                to="/admin/catalogue/$id"
                params={{ id: m.id }}
                className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <img src={m.image} alt={m.name} loading="lazy" width={1024} height={768} className="h-36 w-full object-cover" />
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.category} · {m.city}</p>
                  <p className="mt-1 text-sm font-semibold text-primary">{formatMAD(m.price)}</p>
                </div>
              </Link>
            ))}
            {!data.prods.length && (
              <p className="text-sm text-muted-foreground">Aucun produit associé à ce client.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
