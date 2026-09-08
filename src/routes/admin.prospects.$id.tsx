import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, ScoreRing, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  conversations,
  formatDate,
  formatDateTime,
  formatMAD,
  machineById,
  machines,
} from "@/lib/data";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/admin/prospects/$id")({
  head: () => ({
    meta: [
      { title: "Fiche prospect 360° — CENTRE 3D" },
      {
        name: "description",
        content: "Fiche prospect complète : qualification IA, conversations, machines consultées, devis et historique.",
      },
      { property: "og:title", content: "Fiche prospect 360° — CENTRE 3D" },
      { property: "og:description", content: "Toute la relation commerciale d'un prospect sur une seule page." },
    ],
  }),
  component: ProspectDetail,
});

function ProspectDetail() {
  const { id } = useParams({ from: "/admin/prospects/$id" });
  const { prospects, quotes, updateProspectStatus } = useApp();
  const prospect = prospects.find((p) => p.id === id);

  if (!prospect) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="font-display text-lg font-semibold">Prospect introuvable</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/admin/prospects">Retour au CRM</Link>
        </Button>
      </div>
    );
  }

  const machine = machineById(prospect.machineId);
  const conversation = conversations.find((c) => c.prospectId === prospect.id) ?? conversations[0]!;
  const relatedQuotes = quotes.slice(0, 3);
  const viewed = machines.filter((m) => m.category === prospect.interest).slice(0, 3);

  const timeline = [
    { label: "Premier contact via " + prospect.source, date: prospect.createdAt, icon: Sparkles },
    { label: "Qualification IA terminée — score " + prospect.score, date: prospect.createdAt, icon: CheckCircle2 },
    { label: `Machine recommandée : ${machine?.name}`, date: prospect.lastInteraction, icon: FileText },
    { label: "Transféré au commercial " + prospect.rep, date: prospect.lastInteraction, icon: CalendarClock },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/admin/prospects">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au CRM
        </Link>
      </Button>

      <PageHeader
        title={prospect.name}
        subtitle={`${prospect.company} · ${prospect.city}, ${prospect.country}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success("Prospect qualifié", { description: "Le statut est passé à « Qualifié »." })}>
              Qualifier
            </Button>
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground shadow-glow"
              onClick={() => {
                updateProspectStatus(prospect.id, "Proposition");
                toast.success("Devis initialisé", { description: `Un devis est en préparation pour ${prospect.name}.` });
              }}
            >
              <FileText className="mr-2 h-4 w-4" /> Créer un devis
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Panel>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="gradient-primary text-base font-semibold text-primary-foreground">
                  {prospect.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold">{prospect.name}</p>
                <StatusPill status={prospect.status} className="mt-1" />
              </div>
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4" /> {prospect.company}</li>
              <li className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {prospect.city}, {prospect.country}</li>
              <li className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {prospect.email}</li>
              <li className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {prospect.phone}</li>
              <li className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4" /> {formatMAD(prospect.budgetMin)} – {formatMAD(prospect.budgetMax)}</li>
            </ul>
          </Panel>

          <Panel title="Qualification IA">
            <div className="flex items-center gap-4">
              <ScoreRing score={prospect.score} size={76} />
              <div>
                <p className="font-display text-lg font-bold">{prospect.score} / 100</p>
                <StatusPill status={prospect.temperature} className="mt-1" />
              </div>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Besoin détecté</dt><dd className="text-right font-medium">{machine?.category} {machine?.power}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Budget</dt><dd className="text-right font-medium">{formatMAD(prospect.budgetMin)} – {formatMAD(prospect.budgetMax)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Localisation</dt><dd className="text-right font-medium">{prospect.city}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Délai</dt><dd className="text-right font-medium">{prospect.horizon}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Canal</dt><dd className="text-right font-medium">{prospect.source}</dd></div>
            </dl>
            <p className="mt-4 rounded-lg border border-primary/15 bg-primary/[0.04] p-3 text-xs leading-relaxed">
              {prospect.aiSummary}
            </p>
          </Panel>
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="conversation">
            <TabsList className="flex-wrap">
              <TabsTrigger value="conversation">Conversation</TabsTrigger>
              <TabsTrigger value="machines">Machines consultées</TabsTrigger>
              <TabsTrigger value="devis">Devis</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="conversation" className="mt-4">
              <Panel title={`Conversation IA · ${conversation.channel}`} padded={false}>
                <ul className="max-h-[440px] space-y-4 overflow-y-auto p-5">
                  {conversation.messages.map((m, i) => (
                    <li key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                      <div
                        className={
                          m.role === "user"
                            ? "max-w-[78%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                            : "max-w-[78%] rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-2.5 text-sm"
                        }
                      >
                        {m.role !== "user" && (
                          <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-primary">
                            <Sparkles className="h-3 w-3" /> Agent IA
                          </p>
                        )}
                        <p className="leading-snug">{m.text}</p>
                        {m.intent && (
                          <p className="mt-1.5 text-[10px] opacity-70">Intention détectée : {m.intent}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            </TabsContent>

            <TabsContent value="machines" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {viewed.map((m) => (
                  <Link key={m.id} to="/admin/catalogue/$id" params={{ id: m.id }} className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
                    <img src={m.image} alt={m.name} loading="lazy" width={1024} height={768} className="h-32 w-full object-cover" />
                    <div className="p-3">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.power} · {m.city}</p>
                      <p className="mt-1 text-sm font-semibold text-primary">{formatMAD(m.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="devis" className="mt-4">
              <Panel padded={false}>
                <ul className="divide-y divide-border">
                  {relatedQuotes.map((q) => (
                    <li key={q.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                      <span className="font-mono text-xs">{q.id}</span>
                      <span className="min-w-0 flex-1 truncate text-sm">{q.machineName}</span>
                      <span className="text-sm font-semibold">{formatMAD(q.total)}</span>
                      <StatusPill status={q.status} />
                      <span className="text-xs text-muted-foreground">{formatDate(q.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Panel title="Notes commerciales">
                <p className="text-sm text-muted-foreground">{prospect.notes}</p>
                <Textarea className="mt-4" placeholder="Ajouter une note interne…" rows={4} />
                <Button className="mt-3" size="sm" onClick={() => toast.success("Note enregistrée")}>
                  Enregistrer la note
                </Button>
              </Panel>
            </TabsContent>
          </Tabs>

          <Panel title="Timeline d'activité">
            <ol className="relative space-y-5 border-l border-border pl-6">
              {timeline.map((t, i) => {
                const Icon = t.icon;
                return (
                  <li key={i} className="relative">
                    <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-primary">
                      <Icon className="h-3 w-3" />
                    </span>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(t.date)}</p>
                  </li>
                );
              })}
            </ol>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="secondary">Source : {prospect.source}</Badge>
              <Badge variant="secondary">Commercial : {prospect.rep}</Badge>
              <Badge variant="secondary">Créé le {formatDate(prospect.createdAt)}</Badge>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
