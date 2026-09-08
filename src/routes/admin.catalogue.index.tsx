import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, FileWarning, LayoutGrid, Pencil, Plus, Search, Tags, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, FilterChips, StatusPill, KpiCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CATEGORIES, CITIES, formatMAD, type Machine } from "@/lib/data";
import { emptyMachineDraft, MachineFormDialog } from "@/components/MachineFormDialog";

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
function CatalogueManagementPage() {
  const { catalogue, suppliers, addMachine, updateMachine, deleteMachine } = useApp();
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
              <p className="mt-3 flex items-center gap-2 rounded-lg bg-surface px-2.5 py-2 text-xs">
                <Truck className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">
                  Fournisseur : <span className="font-medium">{suppliers.find((s) => s.id === m.supplierId)?.name ?? "Non attribué"}</span>
                </span>
              </p>
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
        initial={emptyMachineDraft(suppliers[0]?.id ?? "")}
        onSubmit={(draft) => {
          addMachine(draft);
          toast.success("Fiche produit créée", { description: `${draft.name} est ajoutée au catalogue.` });
        }}
      />

      <MachineFormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={`Modifier — ${editing?.name ?? ""}`}
        initial={editing ?? emptyMachineDraft(suppliers[0]?.id ?? "")}
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
