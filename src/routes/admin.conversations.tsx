import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Search, Send, Sparkles, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, ScoreRing, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { conversations, formatDate, machineById, type ChatMessage } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/conversations")({
  head: () => ({
    meta: [
      { title: "Conversations IA — CENTRE 3D" },
      { name: "description", content: "Suivi en direct des conversations de l'agent IA : qualification, intentions détectées et transfert au commercial." },
      { property: "og:title", content: "Conversations IA — CENTRE 3D" },
      { property: "og:description", content: "24 conversations qualifiées par l'agent IA multicanal." },
    ],
  }),
  component: ConversationsPage,
});

function ConversationsPage() {
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState(conversations[0]!.id);
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<Record<string, ChatMessage[]>>({});

  const list = useMemo(
    () => conversations.filter((c) => !q || `${c.prospectName} ${c.company} ${c.city}`.toLowerCase().includes(q.toLowerCase())),
    [q],
  );
  const active = conversations.find((c) => c.id === activeId)!;
  const messages = [...active.messages, ...(extra[active.id] ?? [])];
  const completion = Math.round((active.extracted.filter((e) => e.done).length / active.extracted.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversations IA"
        subtitle={`${list.length} conversations · agent de qualification multicanal`}
        actions={
          <Button size="sm" variant="outline" onClick={() => toast.success("Agent IA rechargé", { description: "Base de connaissances synchronisée avec le catalogue." })}>
            <Bot className="mr-2 h-4 w-4" /> Recharger l'agent
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[320px_1fr_300px]">
        <Panel padded={false} className="overflow-hidden">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="pl-9" />
            </div>
          </div>
          <ul className="max-h-[620px] divide-y divide-border overflow-y-auto">
            {list.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "flex w-full gap-3 p-3 text-left transition-colors hover:bg-accent/60",
                    c.id === activeId && "bg-accent",
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {c.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{c.prospectName}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{formatDate(c.updatedAt)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{c.company}</span>
                    <span className="mt-1.5 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{c.channel}</Badge>
                      <StatusPill status={c.status} className="px-1.5 py-0 text-[10px]" />
                      {c.unread > 0 && (
                        <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                          {c.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel padded={false} className="flex flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-border p-4">
            <div>
              <h2 className="font-display text-base font-semibold">{active.prospectName}</h2>
              <p className="text-xs text-muted-foreground">{active.company} · {active.city} · {active.channel}</p>
            </div>
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground"
              onClick={() => toast.success("Transféré au commercial", { description: `${active.prospectName} a été assigné à un conseiller.` })}
            >
              <UserCheck className="mr-2 h-4 w-4" /> Transférer
            </Button>
          </header>

          <ul className="flex max-h-[480px] flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <li
                key={i}
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm",
                  m.role === "user"
                    ? "ml-auto rounded-br-sm bg-primary text-primary-foreground"
                    : m.role === "agent"
                      ? "ml-auto rounded-br-sm border border-primary/25 bg-primary/10"
                      : "rounded-bl-sm border border-border bg-surface",
                )}
              >
                {m.role === "ai" && (
                  <span className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                    <Sparkles className="h-3 w-3" /> Agent IA
                  </span>
                )}
                <p>{m.text}</p>
                <span className={cn("mt-1 block text-[10px]", m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {new Date(m.time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  {m.intent ? ` · intention : ${m.intent}` : ""}
                </span>
              </li>
            ))}
          </ul>

          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              const msg: ChatMessage = { role: "agent", text: draft, time: new Date().toISOString() };
              setExtra((prev) => ({ ...prev, [active.id]: [...(prev[active.id] ?? []), msg] }));
              setDraft("");
            }}
          >
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Répondre en tant que commercial…" />
            <Button type="submit" size="icon" className="gradient-primary text-primary-foreground" aria-label="Envoyer">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Panel>

        <div className="space-y-5">
          <Panel title="Score de qualification">
            <div className="flex items-center gap-4">
              <ScoreRing score={active.score} size={72} />
              <div className="text-sm">
                <p className="font-medium">{active.score >= 75 ? "Lead chaud" : active.score >= 50 ? "Lead tiède" : "Lead froid"}</p>
                <p className="text-xs text-muted-foreground">Complétude des informations : {completion} %</p>
              </div>
            </div>
            <Progress value={completion} className="mt-4" />
          </Panel>

          <Panel title="Informations extraites">
            <ul className="space-y-2.5 text-sm">
              {active.extracted.map((e) => (
                <li key={e.label} className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{e.label}</span>
                  <span className={cn("text-right font-medium", !e.done && "text-muted-foreground/60")}>{e.value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Machines recommandées">
            <ul className="space-y-3">
              {active.recommended.map((id) => {
                const m = machineById(id);
                if (!m) return null;
                return (
                  <li key={id}>
                    <Link to="/admin/catalogue/$id" params={{ id }} className="flex items-center gap-3 rounded-lg border border-border p-2 transition-colors hover:bg-accent/60">
                      <img src={m.image} alt={m.name} loading="lazy" width={200} height={150} className="h-11 w-14 rounded object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{m.name}</span>
                        <span className="block text-xs text-muted-foreground">{m.power} · {m.city}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
