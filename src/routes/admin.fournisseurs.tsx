import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Boxes, Mail, Minus, PackageCheck, Pencil, Plus, Send, Trash2, Truck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { KpiCard, PageHeader, Panel, StatusPill } from "@/components/ui-kit";
import { DataTable, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CITIES, formatDate, formatMAD, type Machine, type PurchaseLine, type Supplier } from "@/lib/data";
import { BrandLockup } from "@/components/brand";

export const Route = createFileRoute("/admin/fournisseurs")({
  head: () => ({
    meta: [
      { title: "Fournisseurs & stock — CENTRE 3D" },
      {
        name: "description",
        content:
          "Gestion des fournisseurs et du stock Centre 3D : partenaires, délais, alertes de rupture et envoi de bons de commande par e-mail.",
      },
      { property: "og:title", content: "Fournisseurs & stock — CENTRE 3D" },
      { property: "og:description", content: "Pilotez vos fournisseurs, votre stock par dépôt et vos bons de commande." },
    ],
  }),
  component: SuppliersStockPage,
});

const ALL = "__all__";

function SuppliersStockPage() {
  const { catalogue, suppliers, purchaseOrders, adjustStock, addSupplier, updateSupplier, deleteSupplier } = useApp();
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [city, setCity] = useState(ALL);
  const [poSupplier, setPoSupplier] = useState<Supplier | null>(null);
  const [prefill, setPrefill] = useState<Machine | null>(null);

  const stockRows = useMemo(
    () => catalogue.filter((m) => city === ALL || m.city === city),
    [catalogue, city],
  );

  const lowStock = catalogue.filter((m) => m.stock <= 1);
  const totalUnits = catalogue.reduce((s, m) => s + m.stock, 0);
  const stockValue = catalogue.reduce((s, m) => s + m.stock * m.price, 0);

  const openPo = (supplier: Supplier, machine?: Machine) => {
    setPrefill(machine ?? null);
    setPoSupplier(supplier);
  };

  const supplierFor = (m: Machine) =>
    suppliers.find((s) => s.id === m.supplierId) ??
    suppliers.find((s) => s.brands.some((b) => b.toLowerCase() === m.brand.toLowerCase())) ??
    suppliers[0]!;

  const stockColumns: Column<Machine>[] = [
    {
      key: "machine",
      header: "Référence",
      sortValue: (m) => m.name,
      render: (m) => (
        <span className="flex items-center gap-3">
          <img src={m.image} alt={m.name} loading="lazy" width={200} height={150} className="h-10 w-14 rounded object-cover" />
          <span className="min-w-0">
            <span className="block truncate font-medium">{m.name}</span>
            <span className="block text-xs text-muted-foreground">{m.brand} · {m.category}</span>
          </span>
        </span>
      ),
    },
    { key: "city", header: "Dépôt", sortValue: (m) => m.city, render: (m) => `${m.city}, ${m.country}` },
    {
      key: "supplier",
      header: "Fournisseur",
      sortValue: (m) => supplierFor(m)?.name ?? "",
      render: (m) => (
        <span className="min-w-0">
          <span className="block truncate">{supplierFor(m)?.name ?? "Non attribué"}</span>
          <span className="block text-xs text-muted-foreground">{supplierFor(m)?.city}</span>
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      sortValue: (m) => m.stock,
      render: (m) => (
        <span className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Diminuer le stock" onClick={() => adjustStock(m.id, -1)}>
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className={m.stock <= 1 ? "w-8 text-center font-semibold text-warning" : "w-8 text-center font-medium"}>{m.stock}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Augmenter le stock" onClick={() => adjustStock(m.id, 1)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </span>
      ),
    },
    { key: "av", header: "État", sortValue: (m) => m.availability, render: (m) => <StatusPill status={m.availability} /> },
    { key: "val", header: "Valeur stock", sortValue: (m) => m.stock * m.price, render: (m) => formatMAD(m.stock * m.price) },
    {
      key: "act",
      header: "",
      render: (m) => (
        <Button size="sm" variant="outline" onClick={() => openPo(supplierFor(m), m)}>
          Bon de commande
        </Button>
      ),
    },
  ];

  const supplierColumns: Column<Supplier>[] = [
    {
      key: "name",
      header: "Fournisseur",
      sortValue: (s) => s.name,
      render: (s) => (
        <span className="min-w-0">
          <span className="block font-medium">{s.name}</span>
          <span className="block text-xs text-muted-foreground">{s.contactName} · {s.email}</span>
        </span>
      ),
    },
    { key: "brands", header: "Marques", render: (s) => s.brands.join(", ") },
    { key: "loc", header: "Localisation", sortValue: (s) => s.country, render: (s) => `${s.city}, ${s.country}` },
    { key: "lead", header: "Délai", sortValue: (s) => s.leadTimeDays, render: (s) => `${s.leadTimeDays} jours` },
    { key: "inco", header: "Incoterm", render: (s) => s.incoterm },
    { key: "rating", header: "Note", sortValue: (s) => s.rating, render: (s) => `${s.rating.toFixed(1)} / 5` },
    {
      key: "refs",
      header: "Références",
      sortValue: (s) => catalogue.filter((m) => m.supplierId === s.id).length,
      render: (s) => `${catalogue.filter((m) => m.supplierId === s.id).length} machine(s)`,
    },
    {
      key: "act",
      header: "",
      render: (s) => (
        <span className="flex items-center justify-end gap-1.5">
          <Button size="sm" variant="outline" onClick={() => openPo(s)}>
            <Mail className="mr-1.5 h-3.5 w-3.5" /> Commander
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Modifier le fournisseur" onClick={() => setEditSupplier(s)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Supprimer le fournisseur" onClick={() => setSupplierToDelete(s)}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </span>
      ),
    },
  ];

  const byCity = CITIES.map((c) => ({
    city: c,
    total: catalogue.filter((m) => m.city === c).reduce((s, m) => s + m.stock, 0),
    refs: catalogue.filter((m) => m.city === c).length,
  })).filter((c) => c.refs > 0);
  const maxCity = Math.max(1, ...byCity.map((c) => c.total));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fournisseurs & stock"
        subtitle="Partenaires d'approvisionnement, niveaux de stock par dépôt et bons de commande"
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setCreatingSupplier(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Nouveau fournisseur
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow" onClick={() => openPo(suppliers[0]!)} disabled={suppliers.length === 0}>
              <Send className="mr-2 h-4 w-4" /> Nouveau bon de commande
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Fournisseurs actifs" value={suppliers.length} icon={<Truck className="h-4 w-4" />} index={0} />
        <KpiCard label="Unités en stock" value={totalUnits} icon={<Boxes className="h-4 w-4" />} index={1} />
        <KpiCard label="Valeur du stock" value={stockValue} format={formatMAD} icon={<PackageCheck className="h-4 w-4" />} index={2} />
        <KpiCard label="Stock critique" value={lowStock.length} icon={<AlertTriangle className="h-4 w-4" />} hint="≤ 1 unité" index={3} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel padded={false}>
          <Tabs defaultValue="stock">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
              <TabsList>
                <TabsTrigger value="stock">Stock</TabsTrigger>
                <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
                <TabsTrigger value="po">Bons de commande</TabsTrigger>
              </TabsList>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-[170px]"><SelectValue placeholder="Dépôt" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tous les dépôts</SelectItem>
                  {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <TabsContent value="stock" className="m-0">
              <DataTable rows={stockRows} columns={stockColumns} pageSize={8} />
            </TabsContent>
            <TabsContent value="suppliers" className="m-0">
              <DataTable rows={suppliers} columns={supplierColumns} pageSize={8} />
            </TabsContent>
            <TabsContent value="po" className="m-0">
              <DataTable
                rows={purchaseOrders}
                pageSize={8}
                emptyTitle="Aucun bon de commande"
                emptyDescription="Créez un bon de commande depuis un fournisseur ou une référence en stock critique."
                columns={[
                  { key: "id", header: "N°", sortValue: (p) => p.id, render: (p) => <span className="font-medium">{p.id}</span> },
                  { key: "sup", header: "Fournisseur", sortValue: (p) => p.supplierName, render: (p) => p.supplierName },
                  { key: "lines", header: "Lignes", render: (p) => `${p.lines.length} référence(s)` },
                  { key: "total", header: "Total TTC", sortValue: (p) => p.totalTTC, render: (p) => formatMAD(p.totalTTC) },
                  { key: "exp", header: "Livraison prévue", render: (p) => formatDate(p.expectedDate) },
                  { key: "st", header: "Statut", render: (p) => <StatusPill status={p.status} /> },
                ]}
              />
            </TabsContent>
          </Tabs>
        </Panel>

        <div className="space-y-5">
          <Panel title="Stock par dépôt">
            <ul className="space-y-3">
              {byCity.map((c) => (
                <li key={c.city}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{c.city}</span>
                    <span className="text-muted-foreground">{c.total} unités · {c.refs} réf.</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[image:var(--gradient-primary)]" style={{ width: `${(c.total / maxCity) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Alertes de rupture" description="Références à réapprovisionner en priorité">
            <ul className="space-y-3">
              {lowStock.slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-center gap-3 rounded-lg border border-warning/25 bg-warning/[0.06] p-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{m.name}</span>
                    <span className="block text-xs text-muted-foreground">{m.city} · {m.stock} unité(s)</span>
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => openPo(supplierFor(m), m)}>Commander</Button>
                </li>
              ))}
              {lowStock.length === 0 && <li className="text-sm text-muted-foreground">Aucune alerte en cours.</li>}
            </ul>
          </Panel>
        </div>
      </div>

      <SupplierFormDialog
        open={creatingSupplier}
        onOpenChange={setCreatingSupplier}
        title="Nouveau fournisseur"
        initial={emptySupplier()}
        onSubmit={(draft) => {
          addSupplier(draft);
          toast.success("Fournisseur ajouté", { description: `${draft.name} rejoint votre panel d'approvisionnement.` });
        }}
      />

      <SupplierFormDialog
        open={editSupplier !== null}
        onOpenChange={(o) => !o && setEditSupplier(null)}
        title={`Modifier — ${editSupplier?.name ?? ""}`}
        initial={editSupplier ?? emptySupplier()}
        onSubmit={(draft) => {
          if (editSupplier) updateSupplier(editSupplier.id, draft);
          toast.success("Fournisseur mis à jour");
          setEditSupplier(null);
        }}
      />

      <AlertDialog open={supplierToDelete !== null} onOpenChange={(o) => !o && setSupplierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce fournisseur ?</AlertDialogTitle>
            <AlertDialogDescription>
              {supplierToDelete?.name} sera retiré du panel. Les machines qui lui sont rattachées devront être réaffectées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (supplierToDelete) {
                  deleteSupplier(supplierToDelete.id);
                  toast.success("Fournisseur supprimé");
                }
                setSupplierToDelete(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {poSupplier && (
        <PurchaseOrderDialog
          key={`${poSupplier.id}-${prefill?.id ?? "none"}`}
          supplier={poSupplier}
          suppliers={suppliers}
          catalogue={catalogue}
          prefill={prefill}
          onClose={() => setPoSupplier(null)}
        />
      )}
    </div>
  );
}

function PurchaseOrderDialog({
  supplier,
  suppliers,
  catalogue,
  prefill,
  onClose,
}: {
  supplier: Supplier;
  suppliers: Supplier[];
  catalogue: Machine[];
  prefill: Machine | null;
  onClose: () => void;
}) {
  const { createPurchaseOrder } = useApp();
  const [supplierId, setSupplierId] = useState(supplier.id);
  const active = suppliers.find((s) => s.id === supplierId) ?? supplier;

  const [lines, setLines] = useState<PurchaseLine[]>(
    prefill
      ? [{ machineId: prefill.id, machineName: prefill.name, quantity: 2, unitCost: Math.round(prefill.price * 0.72) }]
      : [],
  );
  const [recipient, setRecipient] = useState(supplier.email);
  const [subject, setSubject] = useState(
    `Bon de commande Centre 3D — approvisionnement ${prefill ? prefill.name : "machines agricoles"}`,
  );
  const [message, setMessage] = useState(
    `Bonjour ${supplier.contactName},\n\nVeuillez trouver ci-joint notre bon de commande pour l'approvisionnement de nos dépôts.\nMerci de nous confirmer la disponibilité, le délai d'expédition et les conditions de transport (${supplier.incoterm}).\n\nCordialement,\nService Achats — Centre 3D`,
  );
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + supplier.leadTimeDays * 86400000).toISOString().slice(0, 10),
  );
  const [deliverySite, setDeliverySite] = useState("Dépôt central — Casablanca");
  const [pick, setPick] = useState("");

  const totalHT = lines.reduce((s, l) => s + l.unitCost * l.quantity, 0);
  const vat = totalHT * 0.2;
  const poNumber = `BC-${3200 + Math.floor(Date.now() / 1000) % 800}`;

  const addLine = (machineId: string) => {
    const m = catalogue.find((x) => x.id === machineId);
    if (!m || lines.some((l) => l.machineId === m.id)) return;
    setLines((l) => [...l, { machineId: m.id, machineName: m.name, quantity: 1, unitCost: Math.round(m.price * 0.72) }]);
    setPick("");
  };

  const send = (status: "Envoyé" | "Brouillon") => {
    if (!lines.length) {
      toast.error("Ajoutez au moins une référence au bon de commande.");
      return;
    }
    createPurchaseOrder({
      supplierId: active.id,
      supplierName: active.name,
      recipient,
      subject,
      message,
      lines,
      expectedDate: new Date(expectedDate).toISOString(),
      deliverySite,
      status,
    });
    toast.success(
      status === "Envoyé" ? "Bon de commande envoyé" : "Brouillon enregistré",
      {
        description:
          status === "Envoyé"
            ? `E-mail transmis à ${recipient} avec le bon de commande en pièce jointe.`
            : `Le bon de commande pour ${active.name} est conservé en brouillon.`,
      },
    );
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bon de commande fournisseur</DialogTitle>
          <DialogDescription>
            Composez les lignes, ajustez l'e-mail puis vérifiez l'aperçu du bon de commande avant l'envoi.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* --------- Édition --------- */}
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Fournisseur</Label>
                <Select
                  value={supplierId}
                  onValueChange={(v) => {
                    setSupplierId(v);
                    const s = suppliers.find((x) => x.id === v);
                    if (s) {
                      setRecipient(s.email);
                      setExpectedDate(new Date(Date.now() + s.leadTimeDays * 86400000).toISOString().slice(0, 10));
                    }
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rcpt">Destinataire</Label>
                <Input id="rcpt" type="email" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subj">Objet de l'e-mail</Label>
              <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="msg">Message</Label>
              <Textarea id="msg" rows={7} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="exp">Livraison souhaitée</Label>
                <Input id="exp" type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site">Lieu de livraison</Label>
                <Input id="site" value={deliverySite} onChange={(e) => setDeliverySite(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Label className="mr-auto">Lignes de commande</Label>
                <Select value={pick} onValueChange={addLine}>
                  <SelectTrigger className="w-[240px]"><SelectValue placeholder="Ajouter une référence…" /></SelectTrigger>
                  <SelectContent>
                    {catalogue.slice(0, 40).map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {lines.length === 0 && <p className="text-sm text-muted-foreground">Aucune référence sélectionnée.</p>}
              <ul className="space-y-2">
                {lines.map((l, i) => (
                  <li key={l.machineId} className="flex flex-wrap items-center gap-2 rounded-md bg-muted/50 p-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{l.machineName}</span>
                    <Input
                      type="number"
                      min={1}
                      aria-label="Quantité"
                      className="h-8 w-16"
                      value={l.quantity}
                      onChange={(e) =>
                        setLines((ls) => ls.map((x, xi) => (xi === i ? { ...x, quantity: Math.max(1, Number(e.target.value)) } : x)))
                      }
                    />
                    <Input
                      type="number"
                      aria-label="Coût unitaire"
                      className="h-8 w-32"
                      value={l.unitCost}
                      onChange={(e) => setLines((ls) => ls.map((x, xi) => (xi === i ? { ...x, unitCost: Number(e.target.value) } : x)))}
                    />
                    <Button variant="ghost" size="sm" onClick={() => setLines((ls) => ls.filter((_, xi) => xi !== i))}>
                      Retirer
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* --------- Aperçus --------- */}
          <Tabs defaultValue="email">
            <TabsList className="w-full">
              <TabsTrigger value="email" className="flex-1">Aperçu e-mail</TabsTrigger>
              <TabsTrigger value="doc" className="flex-1">Aperçu bon de commande</TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="space-y-1 border-b border-border bg-muted/40 p-4 text-xs">
                  <p><span className="text-muted-foreground">De : </span>achats@centre3d.ma</p>
                  <p><span className="text-muted-foreground">À : </span>{recipient || "—"}</p>
                  <p><span className="text-muted-foreground">Objet : </span><span className="font-medium text-foreground">{subject}</span></p>
                </div>
                <div className="bg-white p-6 text-[13px] leading-relaxed text-neutral-800">
                  <div className="mb-4"><BrandLockup /></div>
                  <p className="whitespace-pre-wrap">{message}</p>
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs">
                    <Mail className="h-4 w-4 text-neutral-500" />
                    <span className="font-medium">{poNumber}.pdf</span>
                    <span className="text-neutral-500">Bon de commande · {lines.length} ligne(s) · {formatMAD(totalHT + vat)}</span>
                  </div>
                  <p className="mt-4 text-[11px] text-neutral-500">
                    Centre 3D — Machines & équipements agricoles · Casablanca, Maroc · achats@centre3d.ma
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="doc">
              <div className="rounded-xl border border-border bg-white p-6 text-[13px] text-neutral-800">
                <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
                  <BrandLockup />
                  <div className="text-right">
                    <p className="font-semibold uppercase tracking-[0.14em] text-neutral-500">Bon de commande</p>
                    <p className="text-lg font-bold">{poNumber}</p>
                    <p className="text-xs text-neutral-500">Émis le {formatDate(new Date().toISOString())}</p>
                  </div>
                </div>
                <div className="grid gap-4 py-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Fournisseur</p>
                    <p className="font-medium">{active.name}</p>
                    <p className="text-xs text-neutral-600">{active.contactName}</p>
                    <p className="text-xs text-neutral-600">{active.email} · {active.phone}</p>
                    <p className="text-xs text-neutral-600">{active.city}, {active.country}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Livraison</p>
                    <p className="font-medium">{deliverySite}</p>
                    <p className="text-xs text-neutral-600">Date souhaitée : {formatDate(new Date(expectedDate).toISOString())}</p>
                    <p className="text-xs text-neutral-600">Incoterm : {active.incoterm}</p>
                    <p className="text-xs text-neutral-600">Paiement : {active.paymentTerms}</p>
                  </div>
                </div>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-100 text-left">
                      <th className="p-2">Référence</th>
                      <th className="p-2">Qté</th>
                      <th className="p-2">Coût unitaire HT</th>
                      <th className="p-2 text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l) => (
                      <tr key={l.machineId} className="border-b border-neutral-200">
                        <td className="p-2">{l.machineName}</td>
                        <td className="p-2">{l.quantity}</td>
                        <td className="p-2">{formatMAD(l.unitCost)}</td>
                        <td className="p-2 text-right">{formatMAD(l.unitCost * l.quantity)}</td>
                      </tr>
                    ))}
                    {lines.length === 0 && (
                      <tr><td colSpan={4} className="p-3 text-center text-neutral-500">Aucune ligne</td></tr>
                    )}
                  </tbody>
                </table>
                <div className="mt-4 ml-auto w-full max-w-[260px] space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-neutral-500">Total HT</span><span>{formatMAD(totalHT)}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">TVA 20 %</span><span>{formatMAD(vat)}</span></div>
                  <div className="flex justify-between border-t border-neutral-300 pt-1 font-bold"><span>Total TTC</span><span>{formatMAD(totalHT + vat)}</span></div>
                </div>
                <p className="mt-5 text-[11px] text-neutral-500">
                  Centre 3D SARL · RC Casablanca 458 921 · ICE 002514789000045 · achats@centre3d.ma
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="outline" onClick={() => send("Brouillon")}>Enregistrer en brouillon</Button>
          <Button className="gradient-primary text-primary-foreground" onClick={() => send("Envoyé")}>
            <Send className="mr-2 h-4 w-4" /> Envoyer l'e-mail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type SupplierDraft = Omit<Supplier, "id">;

const emptySupplier = (): SupplierDraft => ({
  name: "",
  brands: [],
  contactName: "",
  email: "",
  phone: "",
  city: "Casablanca",
  country: "Maroc",
  incoterm: "Franco dépôt",
  leadTimeDays: 30,
  paymentTerms: "Virement à 45 jours",
  rating: 4.5,
  since: String(new Date().getFullYear()),
});

function SupplierFormDialog({
  open,
  onOpenChange,
  title,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  initial: SupplierDraft;
  onSubmit: (draft: SupplierDraft) => void;
}) {
  const [draft, setDraft] = useState<SupplierDraft>(initial);
  const [key, setKey] = useState("");

  const signature = `${open}-${initial.name}-${initial.email}`;
  if (signature !== key) {
    setKey(signature);
    setDraft(initial);
  }

  const set = <K extends keyof SupplierDraft>(k: K, v: SupplierDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Coordonnées, marques distribuées, délais et conditions commerciales du fournisseur.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(draft);
            onOpenChange(false);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="sn">Raison sociale *</Label><Input id="sn" required value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="AgriMech Europe SA" /></div>
            <div className="space-y-2"><Label htmlFor="sc">Contact *</Label><Input id="sc" required value={draft.contactName} onChange={(e) => set("contactName", e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="se">E-mail *</Label><Input id="se" required type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="sp">Téléphone</Label><Input id="sp" value={draft.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input value={draft.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="space-y-2"><Label htmlFor="sco">Pays</Label><Input id="sco" value={draft.country} onChange={(e) => set("country", e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="si">Incoterm</Label><Input id="si" value={draft.incoterm} onChange={(e) => set("incoterm", e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="sl">Délai (jours)</Label><Input id="sl" type="number" min={0} value={draft.leadTimeDays} onChange={(e) => set("leadTimeDays", Number(e.target.value) || 0)} /></div>
            <div className="space-y-2"><Label htmlFor="sr">Note (/5)</Label><Input id="sr" type="number" step="0.1" min={0} max={5} value={draft.rating} onChange={(e) => set("rating", Number(e.target.value) || 0)} /></div>
            <div className="space-y-2"><Label htmlFor="ss">Partenaire depuis</Label><Input id="ss" value={draft.since} onChange={(e) => set("since", e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sb">Marques distribuées</Label>
            <Input id="sb" value={draft.brands.join(", ")} onChange={(e) => set("brands", e.target.value.split(",").map((b) => b.trim()).filter(Boolean))} placeholder="AgriMech, TerraPro" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spt">Conditions de paiement</Label>
            <Textarea id="spt" rows={2} value={draft.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" className="gradient-primary text-primary-foreground">Enregistrer le fournisseur</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
