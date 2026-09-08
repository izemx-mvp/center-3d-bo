import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Radio, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { KpiCard, PageHeader, Panel } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CHANNELS, clients, formatDate } from "@/lib/data";

export const Route = createFileRoute("/admin/communication")({
  head: () => ({
    meta: [
      { title: "Communication multicanale — CENTRE 3D" },
      { name: "description", content: "Campagnes email, WhatsApp et SMS vers les clients et prospects, avec modèles de messages et historique d'envoi." },
      { property: "og:title", content: "Communication multicanale — CENTRE 3D" },
      { property: "og:description", content: "Pilotez vos campagnes email, WhatsApp et SMS depuis un seul écran." },
    ],
  }),
  component: CommunicationPage,
});

const TEMPLATES = [
  { name: "Relance devis", channel: "Email", body: "Bonjour {{prenom}}, votre devis {{devis}} arrive à échéance le {{date}}. Souhaitez-vous en discuter ?" },
  { name: "Nouvelle arrivée", channel: "WhatsApp", body: "Bonjour {{prenom}}, une nouvelle moissonneuse vient d'arriver dans notre dépôt de {{ville}}." },
  { name: "Confirmation livraison", channel: "SMS", body: "Votre commande {{commande}} sera livrée le {{date}} à {{ville}}. Merci de votre confiance." },
  { name: "Rappel paiement", channel: "Email", body: "Bonjour {{prenom}}, la facture {{facture}} est échue depuis {{jours}} jours." },
];

const HISTORY = clients.slice(0, 8).map((c, i) => ({
  id: c.id,
  client: c.name,
  company: c.company,
  channel: CHANNELS[i % CHANNELS.length]!,
  subject: ["Relance devis", "Nouvelle arrivée", "Confirmation livraison", "Rappel paiement"][i % 4]!,
  date: c.since,
  opened: i % 3 !== 0,
}));

function CommunicationPage() {
  const [channel, setChannel] = useState("Email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("Tous les clients");

  return (
    <div className="space-y-6">
      <PageHeader title="Communication" subtitle="Campagnes email, WhatsApp et SMS" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Messages envoyés" value={2846} icon={<Send className="h-4 w-4" />} delta={12.4} index={0} />
        <KpiCard label="Taux d'ouverture" value={62.4} format={(n) => `${n.toFixed(1)} %`} icon={<Mail className="h-4 w-4" />} delta={3.8} index={1} />
        <KpiCard label="Réponses WhatsApp" value={418} icon={<MessageSquare className="h-4 w-4" />} delta={9.1} index={2} />
        <KpiCard label="Campagnes actives" value={6} icon={<Radio className="h-4 w-4" />} delta={1.0} index={3} />
      </div>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">Nouvelle campagne</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-4">
          <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
            <Panel title="Composer un message">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Campagne programmée", { description: `${channel} · ${audience}` });
                  setSubject("");
                  setBody("");
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Canal</Label>
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Email", "WhatsApp", "SMS"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Audience</Label>
                    <Select value={audience} onValueChange={setAudience}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Tous les clients", "Grands comptes", "Coopératives", "Prospects chauds", "Devis en attente"].map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subj">Objet</Label>
                  <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Nouvelle gamme de tracteurs disponible" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea id="body" rows={9} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Bonjour {{prenom}}, …" required />
                  <p className="text-xs text-muted-foreground">Variables disponibles : {"{{prenom}}"}, {"{{societe}}"}, {"{{ville}}"}, {"{{devis}}"}.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => toast.info("Aperçu envoyé sur votre adresse")}>Tester l'envoi</Button>
                  <Button type="submit" className="gradient-primary text-primary-foreground">
                    <Send className="mr-2 h-4 w-4" /> Programmer la campagne
                  </Button>
                </div>
              </form>
            </Panel>

            <Panel title="Suggestions IA">
              <ul className="space-y-3 text-sm">
                {[
                  "12 devis expirent cette semaine — programmez une relance WhatsApp.",
                  "Les emails envoyés le mardi matin obtiennent +18 % d'ouverture.",
                  "8 coopératives n'ont pas commandé depuis 6 mois : campagne de réactivation.",
                ].map((s) => (
                  <li key={s} className="flex gap-2 rounded-lg border border-primary/15 bg-primary/[0.04] p-3">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {TEMPLATES.map((t) => (
              <Panel key={t.name} title={t.name} action={<Badge variant="secondary">{t.channel}</Badge>}>
                <p className="text-sm text-muted-foreground">{t.body}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => { setChannel(t.channel); setSubject(t.name); setBody(t.body); toast.success("Modèle chargé dans le composeur"); }}
                >
                  Utiliser ce modèle
                </Button>
              </Panel>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Panel padded={false}>
            <ul className="divide-y divide-border">
              {HISTORY.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">{h.subject}</p>
                    <p className="text-xs text-muted-foreground">{h.client} · {h.company}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{h.channel}</Badge>
                    <Badge variant={h.opened ? "default" : "secondary"}>{h.opened ? "Ouvert" : "Envoyé"}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(h.date)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
