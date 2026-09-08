import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CalendarCheck, MapPin, Send, ShoppingCart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatMAD, machineById, machines } from "@/lib/data";

export const Route = createFileRoute("/admin/catalogue/$id")({
  head: () => ({
    meta: [
      { title: "Fiche machine — CENTRE 3D" },
      {
        name: "description",
        content: "Fiche machine détaillée : galerie, caractéristiques techniques, prix, disponibilité et assistant IA contextualisé.",
      },
      { property: "og:title", content: "Fiche machine agricole — CENTRE 3D" },
      { property: "og:description", content: "Caractéristiques, prix et disponibilité de la machine sélectionnée." },
    ],
  }),
  component: MachineDetail,
});

function MachineDetail() {
  const { id } = useParams({ from: "/admin/catalogue/$id" });
  const machine = machineById(id);
  const [active, setActive] = useState(0);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);

  if (!machine) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="font-display text-lg font-semibold">Machine introuvable</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/admin/catalogue">Retour au catalogue</Link>
        </Button>
      </div>
    );
  }

  const gallery = [machine.image, ...machines.filter((m) => m.category === machine.category && m.id !== machine.id).slice(0, 3).map((m) => m.image)];
  const similar = machines.filter((m) => m.category === machine.category && m.id !== machine.id).slice(0, 3);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/admin/catalogue"><ArrowLeft className="mr-2 h-4 w-4" /> Retour au catalogue</Link>
      </Button>

      <PageHeader
        title={machine.name}
        subtitle={`${machine.category} · ${machine.brand} ${machine.model} · ${machine.year}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success("Machine réservée", { description: `${machine.name} réservée pour 7 jours.` })}>
              <CalendarCheck className="mr-2 h-4 w-4" /> Réserver
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow" onClick={() => toast.success("Devis créé", { description: "Le devis a été initialisé avec cette machine." })}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Créer un devis
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
            <img
              src={gallery[active]}
              alt={`${machine.name} — vue ${active + 1}`}
              width={1024}
              height={768}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-lg border-2 transition-all ${i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <img src={g} alt={`Miniature ${i + 1}`} loading="lazy" width={1024} height={768} className="h-20 w-full object-cover" />
              </button>
            ))}
          </div>

          <Panel title="Description">
            <p className="text-sm leading-relaxed text-muted-foreground">{machine.description}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {machine.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {f}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-3xl font-bold text-primary">{formatMAD(machine.price)}</p>
                <p className="text-xs text-muted-foreground">Prix HT · TVA {machine.vat} % · livraison en sus</p>
              </div>
              <StatusPill status={machine.availability} />
            </div>
            <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
              {[
                ["Puissance", machine.power],
                ["Capacité", machine.capacity],
                ["Dimensions", machine.dimensions],
                ["Poids", machine.weight],
                ["Année", String(machine.year)],
                ["Stock", `${machine.stock} unité(s)`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" /> {machine.city}, {machine.country}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">{machine.usage}</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={() => toast.info("Conseiller notifié", { description: "Un commercial vous rappellera sous 2 h." })}>
                Contacter un conseiller
              </Button>
              <Button className="gradient-primary text-primary-foreground" onClick={() => toast.success("Commande initialisée")}>
                Acheter
              </Button>
            </div>
          </Panel>

          <Panel title="Assistant IA machine" description="Vous avez une question sur cette machine ?">
            <ul className="space-y-3">
              <li className="flex gap-2 rounded-lg border border-primary/15 bg-primary/[0.04] p-3 text-sm">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  Bonjour, je connais parfaitement le {machine.name} : {machine.power}, {machine.capacity}, disponible à {machine.city}. Que souhaitez-vous savoir ?
                </p>
              </li>
              {answers.map((a, i) => (
                <li key={i} className="space-y-2">
                  <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">{a.q}</p>
                  <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm border border-border bg-surface px-3 py-2 text-sm">{a.a}</p>
                </li>
              ))}
            </ul>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!question.trim()) return;
                const a = `Le ${machine.name} développe ${machine.power} pour une capacité de ${machine.capacity}. Il est ${machine.availability.toLowerCase()} à ${machine.city} au prix de ${formatMAD(machine.price)} HT. Idéal pour : ${machine.usage.toLowerCase()}.`;
                setAnswers((prev) => [...prev, { q: question, a }]);
                setQuestion("");
              }}
            >
              <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Posez votre question…" />
              <Button type="submit" size="icon" className="gradient-primary text-primary-foreground" aria-label="Envoyer">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Panel>
        </div>
      </div>

      <Panel title="Machines similaires">
        <div className="grid gap-4 sm:grid-cols-3">
          {similar.map((m) => (
            <Link key={m.id} to="/admin/catalogue/$id" params={{ id: m.id }} className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <img src={m.image} alt={m.name} loading="lazy" width={1024} height={768} className="h-36 w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">{formatMAD(m.price)}</span>
                  <Badge variant="secondary" className="text-[10px]">{m.city}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
