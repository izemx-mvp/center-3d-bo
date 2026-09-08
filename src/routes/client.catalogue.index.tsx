import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GitCompare, Heart, Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-state";
import { CATEGORIES, CITIES, formatMAD, machineById, machines } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/client/catalogue/")({
  head: () => ({
    meta: [
      { title: "Catalogue machines agricoles — Espace client CENTRE 3D" },
      { name: "description", content: "Parcourez les tracteurs, moissonneuses, semoirs et systèmes d'irrigation disponibles, comparez-les et demandez un devis." },
      { property: "og:title", content: "Catalogue machines agricoles — CENTRE 3D" },
      { property: "og:description", content: "Comparez les machines, vérifiez la disponibilité et demandez un devis en ligne." },
    ],
  }),
  component: ClientCatalogue,
});

const ALL = "__all__";

function ClientCatalogue() {
  const { favorites, compare, toggleFavorite, toggleCompare, catalogue, addToCart } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(ALL);
  const [city, setCity] = useState(ALL);
  const [sort, setSort] = useState("recent");
  const [maxPrice, setMaxPrice] = useState(2600000);

  const rows = useMemo(() => {
    const list = catalogue.filter(
      (m) =>
        (!q || `${m.name} ${m.brand} ${m.category}`.toLowerCase().includes(q.toLowerCase())) &&
        (cat === ALL || m.category === cat) &&
        (city === ALL || m.city === city) &&
        m.price <= maxPrice,
    );
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "power") return [...list].sort((a, b) => parseInt(b.power) - parseInt(a.power));
    return list;
  }, [q, cat, city, sort, maxPrice]);

  return (
    <div className="space-y-6">
      <PageHeader title="Catalogue" subtitle={`${rows.length} machines disponibles à la vente`} />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-5">
          <Panel title="Filtres">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={cat} onValueChange={setCat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Toutes catégories</SelectItem>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Localisation</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Toutes les villes</SelectItem>
                    {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget maximum : {formatMAD(maxPrice)}</Label>
                <Slider value={[maxPrice]} min={150000} max={2600000} step={50000} onValueChange={([v]) => setMaxPrice(v ?? 2600000)} />
              </div>
              <div className="space-y-2">
                <Label>Trier par</Label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Pertinence</SelectItem>
                    <SelectItem value="price-asc">Prix croissant</SelectItem>
                    <SelectItem value="price-desc">Prix décroissant</SelectItem>
                    <SelectItem value="power">Puissance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Panel>

          {compare.length > 0 && (
            <Panel title={`Comparateur (${compare.length})`}>
              <ul className="space-y-2 text-sm">
                {compare.map((id) => {
                  const m = machineById(id);
                  return m ? (
                    <li key={id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{m.name}</span>
                      <button onClick={() => toggleCompare(id)} className="text-xs text-muted-foreground hover:text-destructive">Retirer</button>
                    </li>
                  ) : null;
                })}
              </ul>
              <Button size="sm" className="mt-4 w-full gradient-primary text-primary-foreground" onClick={() => toast.info("Comparaison prête", { description: `${compare.length} machines comparées.` })}>
                Comparer
              </Button>
            </Panel>
          )}
        </aside>

        <div className="space-y-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une machine…" className="pl-9" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((m, i) => (
              <article
                key={m.id}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated animate-rise-in"
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
              >
                <div className="relative">
                  <img src={m.image} alt={`${m.name} — ${m.category}`} loading="lazy" width={1024} height={768} className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <StatusPill status={m.availability} className="absolute left-3 top-3 bg-card/90 backdrop-blur" />
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    <button
                      onClick={() => toggleFavorite(m.id)}
                      aria-label="Ajouter aux favoris"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-card/90 backdrop-blur transition-colors hover:bg-card"
                    >
                      <Heart className={cn("h-4 w-4", favorites.includes(m.id) ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                    </button>
                    <button
                      onClick={() => toggleCompare(m.id)}
                      aria-label="Ajouter au comparateur"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-card/90 backdrop-blur transition-colors hover:bg-card"
                    >
                      <GitCompare className={cn("h-4 w-4", compare.includes(m.id) ? "text-primary" : "text-muted-foreground")} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="truncate font-display text-base font-semibold">{m.name}</h3>
                  <p className="text-xs text-muted-foreground">{m.brand} · {m.power} · {m.city}</p>
                  <p className="mt-2 font-display text-lg font-bold text-primary">{formatMAD(m.price)}</p>
                  <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                    <Button className="gradient-primary text-primary-foreground" size="sm" asChild>
                      <Link to="/client/catalogue/$id" params={{ id: m.id }}>Voir la machine</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label="Ajouter au panier"
                      disabled={m.availability === "Indisponible"}
                      onClick={() => {
                        addToCart(m.id);
                        toast.success("Ajouté au panier", { description: m.name });
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
