import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ImagePlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, FilterChips, StatusPill, KpiCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { BRANDS, CATEGORIES, CITIES, COUNTRIES, formatMAD, type Availability, type Category, type Machine } from "@/lib/data";
import defaultImage from "@/assets/machine-tracteur.jpg";

export const Route = createFileRoute("/admin/catalogue/")({
  head: () => ({
    meta: [
      { title: "Gestion du catalogue — CENTRE 3D" },
      {
        name: "description",
        content:
          "Gestion du catalogue Centre 3D : ajout, modification et suppression des machines agricoles, photos, prix, descriptions et fiches techniques.",
      },
      { property: "og:title", content: "Gestion du catalogue machines — CENTRE 3D" },
      { property: "og:description", content: "Administrez les fiches produits : photos, désignations, prix HT, TVA et descriptions techniques." },
    ],
  }),
  component: CatalogueManagementPage,
});

const ALL = "__all__";
const AVAILABILITIES: Availability[] = ["Disponible", "Réservée", "Indisponible", "Prochainement"];

type Draft = Omit<Machine, "id" | "demand">;

const emptyDraft = (): Draft => ({
  name: "",
  brand: BRANDS[0] as string,
  model: "",
  category: "Tracteurs",
  year: 2026,
  power: "",
  capacity: "",
  dimensions: "",
  weight: "",
  usage: "",
  price: 0,
  vat: 20,
  city: "Rabat",
  country: "Maroc",
  availability: "Disponible",
  stock: 1,
  image: defaultImage,
  description: "",
  features: [],
});

function CatalogueManagementPage() {
  const { catalogue, addMachine, updateMachine, deleteMachine } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(ALL);
  const [city, setCity] = useState(ALL);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Machine | null>(null);

  const filtered = useMemo(
    () =>
      catalogue.filter(
        (m) =>
          (!q || `${m.name} ${m.brand} ${m.model} ${m.category} ${m.description}`.toLowerCase().includes(q.toLowerCase())) &&
          (cat === ALL || m.category === cat) &&
          (city === ALL || m.city === city),
      ),
    [catalogue, q, cat, city],
  );

  const chips = [
    cat !== ALL && { key: "cat", label: cat, onRemove: () => setCat(ALL) },
    city !== ALL && { key: "city", label: city, onRemove: () => setCity(ALL) },
    q !== "" && { key: "q", label: `« ${q} »`, onRemove: () => setQ("") },
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

  const avgPrice = catalogue.length ? catalogue.reduce((s, m) => s + m.price, 0) / catalogue.length : 0;
  const missingDesc = catalogue.filter((m) => m.description.trim().length < 40).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion du catalogue"
        subtitle="Créez, modifiez et retirez les fiches produits : photos, désignations, prix et descriptions"
        actions={
          <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow" onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle fiche produit
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Fiches produits" value={catalogue.length} icon={<LayoutGrid className="h-4 w-4" />} index={0} />
        <KpiCard label="Catégories" value={CATEGORIES.length} icon={<Tags className="h-4 w-4" />} index={1} />
        <KpiCard label="Prix moyen" value={avgPrice} format={formatMAD} icon={<Coins className="h-4 w-4" />} index={2} />
        <KpiCard label="Descriptions à compléter" value={missingDesc} icon={<FileWarning className="h-4 w-4" />} hint="Moins de 40 caractères" index={3} />
      </div>

      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une fiche produit…" className="pl-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes catégories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Dépôt" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les dépôts</SelectItem>
              {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {chips.length > 0 && <div className="mt-4"><FilterChips chips={chips} onClear={() => { setCat(ALL); setCity(ALL); setQ(""); }} /></div>}
      </Panel>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m, i) => (
          <article
            key={m.id}
            className="group animate-rise-in overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
            style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
          >
            <div className="relative overflow-hidden">
              <img
                src={m.image}
                alt={`${m.name} — ${m.category}`}
                loading="lazy"
                width={1024}
                height={768}
                className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
              <StatusPill status={m.availability} className="absolute left-3 top-3 bg-card/90 backdrop-blur" />
              <span className="absolute bottom-3 left-3 text-xs font-medium uppercase tracking-[0.14em] text-white/90">{m.category}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-semibold">{m.name}</h3>
                  <p className="text-xs text-muted-foreground">{m.brand} · {m.model} · {m.year}</p>
                </div>
                <span className="shrink-0 text-right">
                  <span className="block font-display text-base font-bold text-primary">{formatMAD(m.price)}</span>
                  <span className="text-[10px] text-muted-foreground">HT · TVA {m.vat} %</span>
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{m.description}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><dt className="inline">Puissance : </dt><dd className="inline font-medium text-foreground">{m.power}</dd></div>
                <div><dt className="inline">Dépôt : </dt><dd className="inline font-medium text-foreground">{m.city}</dd></div>
              </dl>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditing(m)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Modifier
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/catalogue/$id" params={{ id: m.id }}>Fiche</Link>
                </Button>
                <Button variant="ghost" size="icon" aria-label="Supprimer" onClick={() => setToDelete(m)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <MachineFormDialog
        open={creating}
        onOpenChange={setCreating}
        title="Nouvelle fiche produit"
        initial={emptyDraft()}
        onSubmit={(draft) => {
          addMachine(draft);
          toast.success("Fiche produit créée", { description: `${draft.name} est ajoutée au catalogue.` });
        }}
      />

      <MachineFormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={`Modifier — ${editing?.name ?? ""}`}
        initial={editing ?? emptyDraft()}
        onSubmit={(draft) => {
          if (editing) updateMachine(editing.id, draft);
          toast.success("Fiche mise à jour", { description: `${draft.name} a été enregistrée.` });
          setEditing(null);
        }}
      />

      <AlertDialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette fiche produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.name} sera retirée du catalogue commercial et de l'espace client. Cette action est immédiate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) {
                  deleteMachine(toDelete.id);
                  toast.success("Fiche supprimée", { description: `${toDelete.name} n'apparaît plus au catalogue.` });
                }
                setToDelete(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MachineFormDialog({
  open,
  onOpenChange,
  title,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  initial: Draft;
  onSubmit: (draft: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [key, setKey] = useState("");

  // resynchronise le formulaire quand on ouvre une autre fiche
  const signature = `${open}-${initial.name}-${initial.price}`;
  if (signature !== key) {
    setKey(signature);
    setDraft(initial);
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Photo, désignation, prix, description et caractéristiques techniques de la machine.</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(draft);
            onOpenChange(false);
          }}
        >
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Photo</legend>
            <div className="flex flex-wrap items-center gap-4">
              <img src={draft.image} alt="Aperçu de la machine" className="h-24 w-36 rounded-lg border border-border object-cover" />
              <div className="min-w-[220px] flex-1 space-y-2">
                <Label htmlFor="img">Adresse de l'image</Label>
                <Input id="img" value={draft.image} onChange={(e) => set("image", e.target.value)} placeholder="https://…" />
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-primary">
                  <ImagePlus className="h-4 w-4" /> Importer depuis l'ordinateur
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) set("image", URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Informations générales</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="mn">Nom *</Label><Input id="mn" required value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="AgriMech X180 Pro" /></div>
              <div className="space-y-2"><Label htmlFor="mb">Marque *</Label><Input id="mb" required value={draft.brand} onChange={(e) => set("brand", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="mm">Modèle</Label><Input id="mm" value={draft.model} onChange={(e) => set("model", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select value={draft.category} onValueChange={(v) => set("category", v as Category)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="my">Année</Label><Input id="my" type="number" value={draft.year} onChange={(e) => set("year", Number(e.target.value))} /></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mdesc">Description commerciale *</Label>
              <Textarea id="mdesc" required rows={4} value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="Décrivez la machine, ses atouts et son usage recommandé…" />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Caractéristiques techniques</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="mp">Puissance</Label><Input id="mp" value={draft.power} onChange={(e) => set("power", e.target.value)} placeholder="180 CV" /></div>
              <div className="space-y-2"><Label htmlFor="mc">Capacité</Label><Input id="mc" value={draft.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="6 t" /></div>
              <div className="space-y-2"><Label htmlFor="md">Dimensions</Label><Input id="md" value={draft.dimensions} onChange={(e) => set("dimensions", e.target.value)} placeholder="5,4 × 2,5 × 3,1 m" /></div>
              <div className="space-y-2"><Label htmlFor="mw">Poids</Label><Input id="mw" value={draft.weight} onChange={(e) => set("weight", e.target.value)} placeholder="8 t" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="mu">Utilisation recommandée</Label><Textarea id="mu" rows={2} value={draft.usage} onChange={(e) => set("usage", e.target.value)} /></div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Prix & disponibilité</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mprice">Prix HT (MAD) *</Label>
                <Input id="mprice" required type="number" value={draft.price} onChange={(e) => set("price", Number(e.target.value))} />
              </div>
              <div className="space-y-2"><Label htmlFor="mvat">TVA (%)</Label><Input id="mvat" type="number" value={draft.vat} onChange={(e) => set("vat", Number(e.target.value))} /></div>
              <div className="space-y-2">
                <Label>Dépôt</Label>
                <Select value={draft.city} onValueChange={(v) => set("city", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pays</Label>
                <Select value={draft.country} onValueChange={(v) => set("country", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Disponibilité</Label>
                <Select value={draft.availability} onValueChange={(v) => set("availability", v as Availability)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{AVAILABILITIES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="mstock">Stock</Label><Input id="mstock" type="number" value={draft.stock} onChange={(e) => set("stock", Number(e.target.value))} /></div>
            </div>
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" className="gradient-primary text-primary-foreground">Enregistrer la fiche</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
