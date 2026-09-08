import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Send, Sparkles } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatMAD, machines } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/client/assistant")({
  head: () => ({
    meta: [
      { title: "Assistant IA — CENTRE 3D" },
      { name: "description", content: "Décrivez votre exploitation et laissez l'assistant IA recommander la machine agricole adaptée, avec prix et disponibilité." },
      { property: "og:title", content: "Assistant IA agricole — CENTRE 3D" },
      { property: "og:description", content: "Conseil personnalisé et recommandation de machines en temps réel." },
    ],
  }),
  component: ClientAssistant,
});

interface Msg { role: "ai" | "user"; text: string; machineIds?: string[] }

const SUGGESTIONS = [
  "J'ai 120 hectares de blé, quel tracteur me conseillez-vous ?",
  "Quelle moissonneuse est disponible à Meknès ?",
  "Quel est le budget pour un système d'irrigation ?",
  "Je cherche un semoir de précision, que proposez-vous ?",
];

function answerFor(question: string): Msg {
  const q = question.toLowerCase();
  const match = (kw: string[]) => kw.some((k) => q.includes(k));

  let category = "Tracteurs";
  if (match(["moissonn", "récolte", "recolte"])) category = "Moissonneuses";
  else if (match(["semoir", "semis"])) category = "Semoirs";
  else if (match(["pulvéris", "pulveris", "traitement"])) category = "Pulvérisateurs";
  else if (match(["irrigation", "arrosage", "eau"])) category = "Irrigation";
  else if (match(["presse", "botte", "fourrage"])) category = "Presses";

  const found = machines.filter((m) => m.category === category).slice(0, 3);
  const cheapest = [...found].sort((a, b) => a.price - b.price)[0];

  return {
    role: "ai",
    text: cheapest
      ? `Pour ce besoin, la catégorie « ${category} » est la plus adaptée. Nous avons ${found.length} modèles disponibles, à partir de ${formatMAD(cheapest.price)} HT, notamment le ${cheapest.name} (${cheapest.power}) disponible à ${cheapest.city}. Souhaitez-vous un devis personnalisé ?`
      : `Je n'ai pas encore de machine correspondant exactement à ce besoin. Un conseiller peut vous rappeler sous 2 h.`,
    machineIds: found.map((m) => m.id),
  };
}

function ClientAssistant() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "Bonjour ! Je suis l'assistant CENTRE 3D. Décrivez-moi votre exploitation — surface, culture, budget, ville — et je vous recommanderai la machine la plus adaptée.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, answerFor(text)]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Assistant IA" subtitle="Conseil personnalisé, disponible 24 h/24" />

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <Panel padded={false} className="flex flex-col">
          <ul className="flex max-h-[540px] flex-1 flex-col gap-4 overflow-y-auto p-5">
            {messages.map((m, i) => (
              <li key={i} className={cn("max-w-[85%]", m.role === "user" && "ml-auto")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm",
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border border-border bg-surface",
                  )}
                >
                  {m.role === "ai" && (
                    <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                      <Sparkles className="h-3 w-3" /> Assistant CENTRE 3D
                    </span>
                  )}
                  <p className="leading-relaxed">{m.text}</p>
                </div>
                {m.machineIds && m.machineIds.length > 0 && (
                  <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                    {m.machineIds.map((id) => {
                      const machine = machines.find((x) => x.id === id)!;
                      return (
                        <li key={id}>
                          <Link to="/client/catalogue/$id" params={{ id }} className="block overflow-hidden rounded-lg border border-border transition-all hover:-translate-y-0.5 hover:shadow-elevated">
                            <img src={machine.image} alt={machine.name} loading="lazy" width={400} height={300} className="h-20 w-full object-cover" />
                            <span className="block p-2">
                              <span className="block truncate text-xs font-medium">{machine.name}</span>
                              <span className="block text-xs text-primary">{formatMAD(machine.price)}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
            {typing && (
              <li className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: `${d * 120}ms` }} />
                ))}
              </li>
            )}
            <div ref={endRef} />
          </ul>

          <form className="flex gap-2 border-t border-border p-4" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
            <Input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Décrivez votre besoin…" />
            <Button type="submit" size="icon" className="gradient-primary text-primary-foreground" aria-label="Envoyer">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Panel>

        <div className="space-y-5">
          <Panel title="Questions fréquentes">
            <ul className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button onClick={() => send(s)} className="w-full rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-accent/60">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Besoin d'un humain ?">
            <p className="text-sm text-muted-foreground">Un conseiller peut reprendre la conversation à tout moment.</p>
            <Badge variant="secondary" className="mt-3">Temps de réponse moyen : 12 min</Badge>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link to="/client/demandes">Voir mes demandes</Link>
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
