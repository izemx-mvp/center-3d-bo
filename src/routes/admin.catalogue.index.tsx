import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, FilterChips, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, CITIES, formatMAD, machines } from "@/lib/data";

export const Route = createFileRoute("/admin/catalogue/")({
  head: () => ({
    meta: [
      { title: "Catalogue machines — CENTRE 3D" },
      {
        name: "description",
        content: "Catalogue complet des machines agricoles importées : tracteurs, moissonneuses, semoirs, pulvérisateurs et irrigation.",
      },
      { property: "og:title", content: "Catalogue machines agricoles — CENTRE 3D" },
      { property: "og:description", content: "34 machines disponibles au Maroc et en Europe, avec prix, disponibilité et fiches techniques." },
    ],
  }),
  component: CataloguePage,
});

const ALL = "__all__";

function CataloguePage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(ALL);
  const [city, setCity] = useState(ALL);
  const [avail, setAvail] = useState(ALL);
  const [maxPrice, setMaxPrice] = useState(2600000);

  const filtered = useMemo(
    () =>
      machines.filter(
        (m) =>
          (!q || `${m.name} ${m.brand} ${m.model} ${m.category}`.toLowerCase().includes(q.toLowerCase())) &&
          (cat === ALL || m.category === cat) &&
          (city === ALL || m.city === city) &&
          (avail === ALL || m.availability === avail) &&
          m.price <= maxPrice,
      ),
    [q, cat, city, avail, maxPrice],
  );

  const chips = [
    cat !== ALL && { key: "cat", label: cat, onRemove: () => setCat(ALL) },
    city !== ALL && { key: "city", label: city, onRemove: () => setCity(ALL) },
    avail !== ALL && { key: "av", label: avail, onRemove: () => setAvail(ALL) },
    maxPrice < 2600000 && { key: "price", label: `≤ ${formatMAD(maxPrice)}`, onRemove: () => setMaxPrice(2600000) },
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

  const reset = () => {
    setCat(ALL);
    setCity(ALL);
    setAvail(ALL);
    setMaxPrice(2600000);
    setQ("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalogue machines"
        subtitle={`${filtered.length} machines correspondent à vos critères`}
        actions={<AddMachineDialog />}
      />

      <Panel>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une machine, une marque…" className="pl-9" />
            </div>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Toutes catégories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Localisation" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Toutes les villes</SelectItem>
                {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={avail} onValueChange={setAvail}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Disponibilité" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Toutes disponibilités</SelectItem>
                {["Disponible", "Réservée", "Indisponible", "Prochainement"].map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[220px]">
            <Label className="text-xs text-muted-foreground">Prix maximum : {formatMAD(maxPrice)}</Label>
            <Slider
              className="mt-3"
              value={[maxPrice]}
              min={150000}
              max={2600000}
              step={50000}
              onValueChange={([v]) => setMaxPrice(v ?? 2600000)}
            />
          </div>
        </div>
        {chips.length > 0 && <div className="mt-4"><FilterChips chips={chips} onClear={reset} /></div>}
      </Panel>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m, i) => (
          <article
            key={m.id}
            className="group overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated animate-rise-in"
            style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
          >
            <div className="relative overflow-hidden">
              <img
                src={m.image}
                alt={`${m.name} — ${m.category}`}
                loading="lazy"
                width={1024}
                height={768}
                className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
              <StatusPill status={m.availability} className="absolute left-3 top-3 bg-card/90 backdrop-blur" />
              <span className="absolute bottom-3 left-3 text-xs font-medium uppercase tracking-[0.14em] text-white/90">
                {m.category}
              </span>
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
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><dt className="inline">Puissance : </dt><dd className="inline font-medium text-foreground">{m.power}</dd></div>
                <div><dt className="inline">Capacité : </dt><dd className="inline font-medium text-foreground">{m.capacity}</dd></div>
                <div><dt className="inline">Ville : </dt><dd className="inline font-medium text-foreground">{m.city}</dd></div>
                <div><dt className="inline">Stock : </dt><dd className="inline font-medium text-foreground">{m.stock}</dd></div>
              </dl>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to="/admin/catalogue/$id" params={{ id: m.id }}>Voir la machine</Link>
                </Button>
                <Button size="sm" className="flex-1 gradient-primary text-primary-foreground" onClick={() => toast.success("Devis initialisé", { description: `${m.name} ajoutée au devis en cours.` })}>
                  Demander un devis
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AddMachineDialog() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<string[]>([]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow">
          <Plus className="mr-2 h-4 w-4" /> Ajouter une machine
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une machine au catalogue</DialogTitle>
          <DialogDescription>Renseignez les informations générales, techniques, commerciales et les médias.</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSaving(true);
            setTimeout(() => {
              setSaving(false);
              setOpen(false);
              toast.success("Machine ajoutée", { description: "La machine est désormais visible dans le catalogue." });
            }, 1200);
          }}
        >
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Informations générales</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="mn">Nom *</Label><Input id="mn" required placeholder="AgriMech X180 Pro" /></div>
              <div className="space-y-2"><Label htmlFor="mb">Marque *</Label><Input id="mb" required placeholder="AgriMech" /></div>
              <div className="space-y-2"><Label htmlFor="mm">Modèle</Label><Input id="mm" placeholder="X180 Pro" /></div>
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select defaultValue="Tracteurs">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="my">Année</Label><Input id="my" type="number" defaultValue={2026} /></div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Caractéristiques techniques</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="mp">Puissance</Label><Input id="mp" placeholder="180 CV" /></div>
              <div className="space-y-2"><Label htmlFor="mc">Capacité</Label><Input id="mc" placeholder="6 t" /></div>
              <div className="space-y-2"><Label htmlFor="md">Dimensions</Label><Input id="md" placeholder="5,4 × 2,5 × 3,1 m" /></div>
              <div className="space-y-2"><Label htmlFor="mw">Poids</Label><Input id="mw" placeholder="8 t" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="mu">Utilisation recommandée</Label><Textarea id="mu" rows={2} placeholder="Travail du sol, traction lourde…" /></div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Informations commerciales</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mprice">Prix (MAD)</Label>
                <div className="relative">
                  <Input id="mprice" type="number" placeholder="685000" className="pr-14" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">MAD</span>
                </div>
              </div>
              <div className="space-y-2"><Label htmlFor="mvat">TVA (%)</Label><Input id="mvat" type="number" defaultValue={20} /></div>
              <div className="space-y-2">
                <Label>Localisation</Label>
                <Select defaultValue="Rabat">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Disponibilité</Label>
                <Select defaultValue="Disponible">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Disponible", "Réservée", "Indisponible", "Prochainement"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Médias</legend>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setFiles((f) => [...f, ...Array.from(e.dataTransfer.files).map((x) => x.name)]);
              }}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-primary/50"
            >
              <Upload className="mb-3 h-6 w-6 text-primary" />
              <p className="text-sm font-medium">Glissez-déposez vos images et vidéos</p>
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, MP4 — 10 Mo maximum par fichier</p>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setFiles((f) => [...f, ...Array.from(e.target.files ?? []).map((x) => x.name)])}
              />
            </label>
            {files.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <li key={i} className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs">{f}</li>
                ))}
              </ul>
            )}
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving} className="gradient-primary text-primary-foreground">
              {saving ? "Enregistrement…" : "Enregistrer la machine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
