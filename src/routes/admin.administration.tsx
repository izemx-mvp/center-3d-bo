import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, KeyRound, Settings2, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SALES_REPS, formatDate } from "@/lib/data";

export const Route = createFileRoute("/admin/administration")({
  head: () => ({
    meta: [
      { title: "Administration — CENTRE 3D" },
      { name: "description", content: "Paramétrage de la plateforme : utilisateurs, rôles et permissions, configuration de l'agent IA et journal d'activité." },
      { property: "og:title", content: "Administration — CENTRE 3D" },
      { property: "og:description", content: "Gérez les utilisateurs, les rôles et le comportement de l'agent IA." },
    ],
  }),
  component: AdministrationPage,
});

const ROLES = ["Administrateur", "Directeur commercial", "Commercial", "Logistique", "Comptabilité"];

const PERMISSIONS = [
  { label: "Accès catalogue", roles: ["Administrateur", "Directeur commercial", "Commercial"] },
  { label: "Édition des devis", roles: ["Administrateur", "Directeur commercial", "Commercial"] },
  { label: "Validation des remises > 7 %", roles: ["Administrateur", "Directeur commercial"] },
  { label: "Gestion des stocks", roles: ["Administrateur", "Logistique"] },
  { label: "Facturation & encaissements", roles: ["Administrateur", "Comptabilité"] },
  { label: "Configuration de l'agent IA", roles: ["Administrateur"] },
];

const LOGS = [
  { user: "Mohamed Chraibi", action: "A validé une remise de 9 % sur le devis DEV-2043", date: "2026-08-28T08:12:00Z" },
  { user: "Salma Idrissi", action: "A créé la commande CMD-2031", date: "2026-08-27T16:40:00Z" },
  { user: "Agent IA", action: "A qualifié 14 nouveaux leads issus de WhatsApp", date: "2026-08-27T09:05:00Z" },
  { user: "Youssef Amrani", action: "A modifié la disponibilité du tracteur X180 Pro", date: "2026-08-26T14:22:00Z" },
  { user: "Nadia Bennis", action: "A émis la facture FAC-7031", date: "2026-08-26T10:58:00Z" },
];

function AdministrationPage() {
  const [temperature, setTemperature] = useState(45);
  const [autoQualify, setAutoQualify] = useState(true);
  const [autoTransfer, setAutoTransfer] = useState(true);
  const [prompt, setPrompt] = useState(
    "Tu es le conseiller commercial virtuel d'CENTRE 3D, importateur de machines agricoles. Qualifie chaque visiteur : besoin, surface exploitée, budget, ville, délai. Recommande une machine du catalogue et propose un devis.",
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Administration" subtitle="Utilisateurs, permissions et configuration de l'agent IA" />

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="roles">Rôles & permissions</TabsTrigger>
          <TabsTrigger value="ia">Agent IA</TabsTrigger>
          <TabsTrigger value="logs">Journal d'activité</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Panel
            title="Équipe commerciale"
            description={`${SALES_REPS.length} utilisateurs actifs`}
            action={
              <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => toast.success("Invitation envoyée")}>
                <UserPlus className="mr-2 h-4 w-4" /> Inviter un utilisateur
              </Button>
            }
            padded={false}
          >
            <ul className="divide-y divide-border">
              {SALES_REPS.map((r, i) => (
                <li key={r.name} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {r.name.split(" ").map((p) => p[0]).join("")}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.name.toLowerCase().replace(/\s+/g, ".")}@agrimach.ma</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select defaultValue={ROLES[Math.min(i + 1, ROLES.length - 1)] ?? "Commercial"}>
                      <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                    </Select>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Panel title="Matrice des permissions" description="Qui peut faire quoi sur la plateforme" padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
                    <th className="p-4">Permission</th>
                    {ROLES.map((r) => <th key={r} className="p-4 text-center">{r}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((p) => (
                    <tr key={p.label} className="border-b border-border last:border-0">
                      <td className="p-4 font-medium">{p.label}</td>
                      {ROLES.map((r) => (
                        <td key={r} className="p-4 text-center">
                          <span className={p.roles.includes(r) ? "text-success" : "text-muted-foreground/40"}>
                            {p.roles.includes(r) ? "✓" : "—"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="ia" className="mt-4">
          <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
            <Panel title="Configuration de l'agent IA" description="Comportement, ton et règles de qualification">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Instruction système</Label>
                  <Textarea id="prompt" rows={7} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Créativité des réponses : {temperature} %</Label>
                  <Slider value={[temperature]} max={100} step={5} onValueChange={([v]) => setTemperature(v ?? 45)} />
                  <p className="text-xs text-muted-foreground">Une valeur basse rend l'agent plus factuel et centré sur les fiches techniques.</p>
                </div>
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Qualification automatique</p>
                      <p className="text-xs text-muted-foreground">L'agent attribue un score et une température à chaque lead.</p>
                    </div>
                    <Switch checked={autoQualify} onCheckedChange={setAutoQualify} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Transfert automatique au commercial</p>
                      <p className="text-xs text-muted-foreground">Déclenché dès qu'un lead dépasse un score de 75.</p>
                    </div>
                    <Switch checked={autoTransfer} onCheckedChange={setAutoTransfer} />
                  </div>
                </div>
                <Button className="gradient-primary text-primary-foreground" onClick={() => toast.success("Configuration enregistrée")}>
                  <Settings2 className="mr-2 h-4 w-4" /> Enregistrer la configuration
                </Button>
              </div>
            </Panel>

            <div className="space-y-5">
              <Panel title="État de l'agent">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between"><span className="text-muted-foreground">Statut</span><Badge className="bg-success/12 text-success">Opérationnel</Badge></li>
                  <li className="flex items-center justify-between"><span className="text-muted-foreground">Conversations / 24 h</span><span className="font-medium">146</span></li>
                  <li className="flex items-center justify-between"><span className="text-muted-foreground">Leads qualifiés</span><span className="font-medium">38</span></li>
                  <li className="flex items-center justify-between"><span className="text-muted-foreground">Temps de réponse moyen</span><span className="font-medium">1,8 s</span></li>
                </ul>
              </Panel>
              <Panel title="Canaux connectés">
                <ul className="space-y-3 text-sm">
                  {[["Site web", true], ["WhatsApp Business", true], ["Instagram", true], ["Facebook Messenger", false]].map(([c, on]) => (
                    <li key={c as string} className="flex items-center justify-between">
                      <span className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> {c as string}</span>
                      <Switch defaultChecked={on as boolean} />
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title="Sécurité">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Authentification à deux facteurs active</li>
                  <li className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> Rotation des clés API tous les 90 jours</li>
                </ul>
              </Panel>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Panel title="Journal d'activité" padded={false}>
            <ul className="divide-y divide-border">
              {LOGS.map((l, i) => (
                <li key={i} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm"><span className="font-medium">{l.user}</span> — {l.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(l.date)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
