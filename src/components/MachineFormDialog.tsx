import { useState } from "react";
import { ImagePlus } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-state";
import { BRANDS, CATEGORIES, CITIES, COUNTRIES, type Availability, type Category, type Machine } from "@/lib/data";
import defaultImage from "@/assets/machine-tracteur.jpg";

export type MachineDraft = Omit<Machine, "id" | "demand">;

const AVAILABILITIES: Availability[] = ["Disponible", "Réservée", "Indisponible", "Prochainement"];

export const emptyMachineDraft = (supplierId: string): MachineDraft => ({
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
  supplierId,
  image: defaultImage,
  description: "",
  features: [],
});

export function MachineFormDialog({
  open,
  onOpenChange,
  title,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  initial: MachineDraft;
  onSubmit: (draft: MachineDraft) => void;
}) {
  const { suppliers } = useApp();
  const [draft, setDraft] = useState<MachineDraft>(initial);
  const [key, setKey] = useState("");

  // resynchronise le formulaire quand on ouvre une autre fiche
  const signature = `${open}-${initial.name}-${initial.price}-${initial.supplierId}`;
  if (signature !== key) {
    setKey(signature);
    setDraft(initial);
  }

  const set = <K extends keyof MachineDraft>(k: K, v: MachineDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Photo, désignation, fournisseur, prix, description et caractéristiques techniques de la machine.
          </DialogDescription>
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
              <div className="space-y-2">
                <Label>Fournisseur *</Label>
                <Select value={draft.supplierId} onValueChange={(v) => set("supplierId", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir un fournisseur" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} · {s.city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
