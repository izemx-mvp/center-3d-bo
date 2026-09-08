import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Eye,
  EyeOff,
  FileDown,
  FileText,
  HelpCircle,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { KpiCard, PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { DataTable, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-state";
import { formatDate, formatMAD, type DocumentItem, type FaqItem, type ServiceOffer } from "@/lib/data";

export const Route = createFileRoute("/admin/service-client")({
  head: () => ({
    meta: [
      { title: "Service client IA — CENTRE 3D" },
      {
        name: "description",
        content:
          "Base de connaissances du service client IA Centre 3D : prestations de service, questions fréquentes et documents techniques, entièrement gérables.",
      },
      { property: "og:title", content: "Service client IA — CENTRE 3D" },
      { property: "og:description", content: "Gérez les prestations, la FAQ et les documents utilisés par l'assistant IA." },
    ],
  }),
  component: ServiceClientPage,
});

const SERVICE_CATEGORIES: ServiceOffer["category"][] = ["Maintenance", "Formation", "Financement", "Livraison", "Garantie"];
const FAQ_CATEGORIES: FaqItem["category"][] = ["Commande", "Livraison", "Paiement", "Technique", "Garantie"];
const DOC_TYPES: DocumentItem["type"][] = ["Fiche technique", "Manuel", "Contrat", "Certificat", "Tarifs"];
const FILE_TYPES: DocumentItem["fileType"][] = ["PDF", "DOCX", "XLSX"];
const VISIBILITIES: DocumentItem["visibility"][] = ["Public", "Clients", "Interne"];

function ServiceClientPage() {
  const {
    services,
    faqs,
    documents,
    addService,
    updateService,
    deleteService,
    addFaq,
    updateFaq,
    deleteFaq,
    addDocument,
    updateDocument,
    deleteDocument,
  } = useApp();

  const [q, setQ] = useState("");
  const [serviceForm, setServiceForm] = useState<{ open: boolean; item: ServiceOffer | null }>({ open: false, item: null });
  const [faqForm, setFaqForm] = useState<{ open: boolean; item: FaqItem | null }>({ open: false, item: null });
  const [docForm, setDocForm] = useState<{ open: boolean; item: DocumentItem | null }>({ open: false, item: null });
  const [remove, setRemove] = useState<{ kind: "service" | "faq" | "doc"; id: string; label: string } | null>(null);

  const term = q.trim().toLowerCase();
  const fServices = useMemo(
    () => services.filter((s) => !term || `${s.name} ${s.category} ${s.description}`.toLowerCase().includes(term)),
    [services, term],
  );
  const fFaqs = useMemo(
    () => faqs.filter((f) => !term || `${f.question} ${f.answer} ${f.category}`.toLowerCase().includes(term)),
    [faqs, term],
  );
  const fDocs = useMemo(
    () => documents.filter((d) => !term || `${d.name} ${d.type} ${d.category}`.toLowerCase().includes(term)),
    [documents, term],
  );

  const confirmRemove = () => {
    if (!remove) return;
    if (remove.kind === "service") deleteService(remove.id);
    if (remove.kind === "faq") deleteFaq(remove.id);
    if (remove.kind === "doc") deleteDocument(remove.id);
    toast.success("Élément supprimé", { description: `${remove.label} a été retiré de la base de connaissances.` });
    setRemove(null);
  };

  const serviceColumns: Column<ServiceOffer>[] = [
    {
      key: "name",
      header: "Prestation",
      sortValue: (s) => s.name,
      render: (s) => (
        <span className="min-w-0">
          <span className="block font-medium">{s.name}</span>
          <span className="block max-w-[420px] truncate text-xs text-muted-foreground">{s.description}</span>
        </span>
      ),
    },
    { key: "cat", header: "Catégorie", sortValue: (s) => s.category, render: (s) => <StatusPill status={s.category} /> },
    {
      key: "price",
      header: "Tarif",
      sortValue: (s) => s.price,
      render: (s) => (
        <span>
          <span className="block font-medium">{s.price === 0 ? "Inclus" : formatMAD(s.price)}</span>
          <span className="block text-xs text-muted-foreground">{s.unit}</span>
        </span>
      ),
    },
    { key: "sla", header: "Engagement", render: (s) => s.sla },
    {
      key: "active",
      header: "Actif",
      render: (s) => (
        <Switch
          checked={s.active}
          aria-label={`Activer ${s.name}`}
          onCheckedChange={(v) => {
            updateService(s.id, { active: v });
            toast.success(v ? "Prestation activée" : "Prestation désactivée", { description: s.name });
          }}
        />
      ),
    },
    {
      key: "act",
      header: "",
      render: (s) => (
        <span className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => setServiceForm({ open: true, item: s })}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Supprimer"
            onClick={() => setRemove({ kind: "service", id: s.id, label: s.name })}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </span>
      ),
    },
  ];

  const faqColumns: Column<FaqItem>[] = [
    {
      key: "q",
      header: "Question",
      sortValue: (f) => f.question,
      render: (f) => (
        <span className="min-w-0">
          <span className="block font-medium">{f.question}</span>
          <span className="block max-w-[460px] truncate text-xs text-muted-foreground">{f.answer}</span>
        </span>
      ),
    },
    { key: "cat", header: "Thème", sortValue: (f) => f.category, render: (f) => <StatusPill status={f.category} /> },
    { key: "views", header: "Consultations", sortValue: (f) => f.views, render: (f) => f.views },
    { key: "upd", header: "Mise à jour", sortValue: (f) => f.updatedAt, render: (f) => formatDate(f.updatedAt) },
    {
      key: "pub",
      header: "Publiée",
      render: (f) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            updateFaq(f.id, { published: !f.published });
            toast.success(f.published ? "Réponse dépubliée" : "Réponse publiée", { description: f.question });
          }}
        >
          {f.published ? <Eye className="mr-1.5 h-4 w-4 text-success" /> : <EyeOff className="mr-1.5 h-4 w-4 text-muted-foreground" />}
          {f.published ? "En ligne" : "Masquée"}
        </Button>
      ),
    },
    {
      key: "act",
      header: "",
      render: (f) => (
        <span className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => setFaqForm({ open: true, item: f })}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Supprimer"
            onClick={() => setRemove({ kind: "faq", id: f.id, label: f.question })}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </span>
      ),
    },
  ];

  const docColumns: Column<DocumentItem>[] = [
    {
      key: "name",
      header: "Document",
      sortValue: (d) => d.name,
      render: (d) => (
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary">
            {d.fileType}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{d.name}</span>
            <span className="block text-xs text-muted-foreground">{d.category} · {(d.sizeKb / 1024).toFixed(1)} Mo</span>
          </span>
        </span>
      ),
    },
    { key: "type", header: "Type", sortValue: (d) => d.type, render: (d) => <StatusPill status={d.type} /> },
    { key: "vis", header: "Visibilité", sortValue: (d) => d.visibility, render: (d) => d.visibility },
    { key: "upd", header: "Mise à jour", sortValue: (d) => d.updatedAt, render: (d) => formatDate(d.updatedAt) },
    {
      key: "act",
      header: "",
      render: (d) => (
        <span className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Ouvrir" asChild>
            <a href={d.url} target="_blank" rel="noreferrer noopener">
              <FileDown className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => setDocForm({ open: true, item: d })}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Supprimer"
            onClick={() => setRemove({ kind: "doc", id: d.id, label: d.name })}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service client IA"
        subtitle="Base de connaissances utilisée par l'assistant : prestations, questions fréquentes et documents"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Prestations actives" value={services.filter((s) => s.active).length} icon={<Wrench className="h-4 w-4" />} index={0} />
        <KpiCard label="Réponses FAQ en ligne" value={faqs.filter((f) => f.published).length} icon={<HelpCircle className="h-4 w-4" />} index={1} />
        <KpiCard label="Documents disponibles" value={documents.length} icon={<FileText className="h-4 w-4" />} index={2} />
        <KpiCard
          label="Consultations FAQ"
          value={faqs.reduce((s, f) => s + f.views, 0)}
          icon={<Sparkles className="h-4 w-4" />}
          hint="30 derniers jours"
          index={3}
        />
      </div>

      <Panel padded={false}>
        <Tabs defaultValue="services">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <TabsList>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="docs">Documents</TabsTrigger>
            </TabsList>
            <div className="relative ml-auto min-w-[220px] flex-1 md:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="pl-9" />
            </div>
          </div>

          <TabsContent value="services" className="m-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Prestations proposées aux clients et citées par l'assistant IA lors des échanges.
              </p>
              <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setServiceForm({ open: true, item: null })}>
                <Plus className="mr-2 h-4 w-4" /> Nouvelle prestation
              </Button>
            </div>
            <DataTable
              rows={fServices}
              columns={serviceColumns}
              pageSize={8}
              emptyTitle="Aucune prestation"
              emptyDescription="Ajoutez une première prestation de service pour vos clients."
            />
          </TabsContent>

          <TabsContent value="faq" className="m-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Questions fréquentes utilisées comme réponses de référence par l'assistant.
              </p>
              <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setFaqForm({ open: true, item: null })}>
                <Plus className="mr-2 h-4 w-4" /> Nouvelle question
              </Button>
            </div>
            <DataTable
              rows={fFaqs}
              columns={faqColumns}
              pageSize={8}
              emptyTitle="Aucune question"
              emptyDescription="Créez votre première question fréquente."
            />
          </TabsContent>

          <TabsContent value="docs" className="m-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Fiches techniques, manuels, contrats et certificats partagés avec les clients.
              </p>
              <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setDocForm({ open: true, item: null })}>
                <Plus className="mr-2 h-4 w-4" /> Nouveau document
              </Button>
            </div>
            <DataTable
              rows={fDocs}
              columns={docColumns}
              pageSize={8}
              emptyTitle="Aucun document"
              emptyDescription="Ajoutez un premier document à la base de connaissances."
            />
          </TabsContent>
        </Tabs>
      </Panel>

      <Panel title="Comment l'assistant utilise ces contenus" description="Priorité de réponse de l'agent Centre 3D">
        <ol className="grid gap-3 text-sm sm:grid-cols-3">
          {[
            { icon: HelpCircle, title: "1. FAQ publiée", text: "L'assistant répond d'abord avec une question fréquente en ligne." },
            { icon: Wrench, title: "2. Prestation active", text: "Il propose ensuite la prestation de service correspondante et son tarif." },
            { icon: BookOpen, title: "3. Document joint", text: "Il transmet enfin la fiche technique ou le contrat lié à la demande." },
          ].map((s) => (
            <li key={s.title} className="rounded-lg border border-border bg-surface/60 p-4">
              <s.icon className="mb-2 h-5 w-5 text-primary" />
              <p className="font-medium">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </Panel>

      {serviceForm.open && (
        <ServiceDialog
          item={serviceForm.item}
          onClose={() => setServiceForm({ open: false, item: null })}
          onSave={(draft) => {
            if (serviceForm.item) {
              updateService(serviceForm.item.id, draft);
              toast.success("Prestation mise à jour", { description: draft.name });
            } else {
              addService(draft);
              toast.success("Prestation créée", { description: draft.name });
            }
          }}
        />
      )}

      {faqForm.open && (
        <FaqDialog
          item={faqForm.item}
          onClose={() => setFaqForm({ open: false, item: null })}
          onSave={(draft) => {
            if (faqForm.item) {
              updateFaq(faqForm.item.id, draft);
              toast.success("Question mise à jour", { description: draft.question });
            } else {
              addFaq(draft);
              toast.success("Question ajoutée", { description: draft.question });
            }
          }}
        />
      )}

      {docForm.open && (
        <DocumentDialog
          item={docForm.item}
          onClose={() => setDocForm({ open: false, item: null })}
          onSave={(draft) => {
            if (docForm.item) {
              updateDocument(docForm.item.id, draft);
              toast.success("Document mis à jour", { description: draft.name });
            } else {
              addDocument(draft);
              toast.success("Document ajouté", { description: draft.name });
            }
          }}
        />
      )}

      <AlertDialog open={remove !== null} onOpenChange={(o) => !o && setRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet élément ?</AlertDialogTitle>
            <AlertDialogDescription>
              {remove?.label} sera retiré de la base de connaissances et l'assistant ne le proposera plus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------ Dialogues ------------------------------ */

function ServiceDialog({
  item,
  onClose,
  onSave,
}: {
  item: ServiceOffer | null;
  onClose: () => void;
  onSave: (draft: Omit<ServiceOffer, "id">) => void;
}) {
  const [draft, setDraft] = useState<Omit<ServiceOffer, "id">>(
    item
      ? { name: item.name, category: item.category, description: item.description, price: item.price, unit: item.unit, sla: item.sla, active: item.active }
      : { name: "", category: "Maintenance", description: "", price: 0, unit: "par machine / an", sla: "Intervention sous 48 h", active: true },
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? `Modifier — ${item.name}` : "Nouvelle prestation de service"}</DialogTitle>
          <DialogDescription>Nom, catégorie, tarif et engagement de service communiqués aux clients.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(draft);
            onClose();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="sname">Nom de la prestation *</Label>
            <Input id="sname" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Maintenance préventive annuelle" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as ServiceOffer["category"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SERVICE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sprice">Tarif HT (MAD) — 0 si inclus</Label>
              <Input id="sprice" type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sunit">Unité de facturation</Label>
              <Input id="sunit" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ssla">Engagement de service</Label>
              <Input id="ssla" value={draft.sla} onChange={(e) => setDraft({ ...draft, sla: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sdesc">Description *</Label>
            <Textarea id="sdesc" required rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span>
              <Label htmlFor="sactive">Prestation active</Label>
              <span className="block text-xs text-muted-foreground">Visible par les clients et proposée par l'assistant IA.</span>
            </span>
            <Switch id="sactive" checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="gradient-primary text-primary-foreground">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FaqDialog({
  item,
  onClose,
  onSave,
}: {
  item: FaqItem | null;
  onClose: () => void;
  onSave: (draft: Omit<FaqItem, "id" | "views" | "updatedAt">) => void;
}) {
  const [draft, setDraft] = useState<Omit<FaqItem, "id" | "views" | "updatedAt">>(
    item
      ? { question: item.question, answer: item.answer, category: item.category, published: item.published }
      : { question: "", answer: "", category: "Commande", published: true },
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Modifier la question" : "Nouvelle question fréquente"}</DialogTitle>
          <DialogDescription>Réponse de référence utilisée par l'assistant IA et l'espace client.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(draft);
            onClose();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="fq">Question *</Label>
            <Input id="fq" required value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} placeholder="Quels sont les délais de livraison ?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fa">Réponse *</Label>
            <Textarea id="fa" required rows={5} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Thème</Label>
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as FaqItem["category"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FAQ_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="fpub">Publiée en ligne</Label>
              <Switch id="fpub" checked={draft.published} onCheckedChange={(v) => setDraft({ ...draft, published: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="gradient-primary text-primary-foreground">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DocumentDialog({
  item,
  onClose,
  onSave,
}: {
  item: DocumentItem | null;
  onClose: () => void;
  onSave: (draft: Omit<DocumentItem, "id" | "updatedAt">) => void;
}) {
  const [draft, setDraft] = useState<Omit<DocumentItem, "id" | "updatedAt">>(
    item
      ? { name: item.name, type: item.type, category: item.category, fileType: item.fileType, sizeKb: item.sizeKb, url: item.url, visibility: item.visibility }
      : { name: "", type: "Fiche technique", category: "Tracteurs", fileType: "PDF", sizeKb: 500, url: "", visibility: "Clients" },
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Modifier le document" : "Nouveau document"}</DialogTitle>
          <DialogDescription>Fiche technique, manuel, contrat ou certificat mis à disposition des clients.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(draft);
            onClose();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="dname">Nom du document *</Label>
            <Input id="dname" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as DocumentItem["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dcat">Rubrique</Label>
              <Input id="dcat" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Tracteurs, Services…" />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={draft.fileType} onValueChange={(v) => setDraft({ ...draft, fileType: v as DocumentItem["fileType"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FILE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visibilité</Label>
              <Select value={draft.visibility} onValueChange={(v) => setDraft({ ...draft, visibility: v as DocumentItem["visibility"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VISIBILITIES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="durl">Adresse du fichier *</Label>
            <Input id="durl" required value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://docs.centre3d.ma/…" />
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-primary">
              <FileText className="h-4 w-4" /> Importer un fichier depuis l'ordinateur
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const ext = file.name.split(".").pop()?.toUpperCase();
                  setDraft({
                    ...draft,
                    name: draft.name || file.name.replace(/\.[^.]+$/, ""),
                    url: URL.createObjectURL(file),
                    sizeKb: Math.max(1, Math.round(file.size / 1024)),
                    fileType: ext === "DOCX" || ext === "XLSX" ? ext : "PDF",
                  });
                }}
              />
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="gradient-primary text-primary-foreground">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
