import tracteur from "@/assets/machine-tracteur.jpg";
import moissonneuse from "@/assets/machine-moissonneuse.jpg";
import semoir from "@/assets/machine-semoir.jpg";
import pulverisateur from "@/assets/machine-pulverisateur.jpg";
import chargeuse from "@/assets/machine-chargeuse.jpg";
import presse from "@/assets/machine-presse.jpg";
import irrigation from "@/assets/machine-irrigation.jpg";

/* ------------------------------------------------------------------ */
/* Référentiels                                                        */
/* ------------------------------------------------------------------ */

export const CITIES = [
  "Rabat",
  "Casablanca",
  "Tanger",
  "Fès",
  "Agadir",
  "Meknès",
  "Marrakech",
  "Oujda",
  "Kénitra",
] as const;

export const COUNTRIES = ["Maroc", "Royaume-Uni", "Espagne", "France", "Portugal"] as const;

export const CHANNELS = ["Website", "WhatsApp", "Instagram", "Facebook", "LinkedIn", "Email"] as const;
export type Channel = (typeof CHANNELS)[number];

export const CATEGORIES = [
  "Tracteurs",
  "Moissonneuses",
  "Semoirs",
  "Pulvérisateurs",
  "Chargeuses",
  "Presses à balles",
  "Irrigation",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_IMAGE: Record<Category, string> = {
  Tracteurs: tracteur,
  Moissonneuses: moissonneuse,
  Semoirs: semoir,
  Pulvérisateurs: pulverisateur,
  Chargeuses: chargeuse,
  "Presses à balles": presse,
  Irrigation: irrigation,
};

export const BRANDS = [
  "AgriMech",
  "Terrafort",
  "NordAgri",
  "Valtria",
  "IberFarm",
  "Kensworth",
  "Atlas Agro",
];

export const SALES_REPS = [
  { id: "SR-1", name: "Youssef Amrani", city: "Rabat", initials: "YA" },
  { id: "SR-2", name: "Salma Berrada", city: "Tanger", initials: "SB" },
  { id: "SR-3", name: "Karim El Fassi", city: "Fès", initials: "KE" },
  { id: "SR-4", name: "Nadia Oufkir", city: "Agadir", initials: "NO" },
  { id: "SR-5", name: "James Whitfield", city: "Londres", initials: "JW" },
];

const FIRST = [
  "Ahmed","Youssef","Fatima","Khalid","Sanaa","Rachid","Imane","Hicham","Nawal","Omar",
  "Leila","Mehdi","Zineb","Anas","Hafsa","Tarik","Amine","Soukaina","Yassine","Ilham",
  "Carlos","Marta","Thomas","Sophie","Miguel","Emma","Daniel","Laura",
];
const LAST = [
  "Benali","El Idrissi","Bouazza","Chraibi","Tazi","Naciri","Sabri","Lahlou","Bennani","Alami",
  "Ouazzani","Ziani","Hamdi","Skalli","Berrada","Moutawakil","Garcia","Ferreira","Dupont","Clarke",
];
const COMPANY_PREFIX = [
  "Domaine","Coopérative","Ferme","Agri","Sté","Groupe","Exploitation","Verger","Plaine","Terroir",
];
const COMPANY_SUFFIX = [
  "Al Baraka","Souss","Gharb","Atlas","Doukkala","Saïss","Loukkos","Tadla","Haouz","Rif",
  "Iberia","Valley Farms","Green Fields","Sud Agri","Nord Céréales",
];

/* Générateur pseudo-aléatoire déterministe (données stables au refresh) */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const rng = makeRng(20260828);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)] as T;
const at = <T,>(arr: readonly T[], i: number): T => arr[i] as T;
const between = (a: number, b: number) => Math.floor(rng() * (b - a + 1)) + a;

const DAY = 86400000;
export const NOW = new Date("2026-08-28T09:00:00Z").getTime();
const daysAgo = (d: number) => new Date(NOW - d * DAY).toISOString();

export const formatMAD = (n: number) =>
  `${new Intl.NumberFormat("fr-FR").format(Math.round(n))} MAD`;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso),
  );

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

/* ------------------------------------------------------------------ */
/* Machines                                                            */
/* ------------------------------------------------------------------ */

export type Availability = "Disponible" | "Réservée" | "Indisponible" | "Prochainement";

export interface Machine {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: Category;
  year: number;
  power: string;
  capacity: string;
  dimensions: string;
  weight: string;
  usage: string;
  price: number;
  vat: number;
  city: string;
  country: string;
  availability: Availability;
  stock: number;
  image: string;
  demand: number;
  description: string;
  features: string[];
}

const MODEL_ROOTS: Record<Category, string[]> = {
  Tracteurs: ["X180 Pro", "T240 Vision", "R150 Compact", "X220 TerraDrive", "T310 Titan"],
  Moissonneuses: ["Harvest 9200", "CropMaster 780", "GrainLine 6400", "Harvest 7100"],
  Semoirs: ["SeedPro 6M", "PrecisionDrill 8", "SowLine 4200", "SeedPro 9M"],
  Pulvérisateurs: ["SprayTech 3000", "AirJet 2400", "FieldGuard 5000", "SprayTech 4200"],
  Chargeuses: ["LoadX 320", "FrontMax 210", "AgriLift 480", "LoadX 560"],
  "Presses à balles": ["BaleRound 550", "CompactBale 300", "BaleMaster 720"],
  Irrigation: ["PivotFlow 400", "AquaLine 250", "PivotFlow 620"],
};

const USAGES: Record<Category, string> = {
  Tracteurs: "Travail du sol, traction lourde, polyvalence sur grandes exploitations",
  Moissonneuses: "Récolte de céréales et oléagineux sur surfaces étendues",
  Semoirs: "Semis de précision, céréales et légumineuses",
  Pulvérisateurs: "Traitement phytosanitaire et fertilisation liquide",
  Chargeuses: "Manutention, chargement de fourrage et matériaux",
  "Presses à balles": "Pressage de paille et de fourrage",
  Irrigation: "Irrigation de précision des grandes parcelles",
};

const PRICE_BASE: Record<Category, [number, number]> = {
  Tracteurs: [380000, 1250000],
  Moissonneuses: [980000, 2600000],
  Semoirs: [180000, 520000],
  Pulvérisateurs: [220000, 690000],
  Chargeuses: [310000, 880000],
  "Presses à balles": [240000, 610000],
  Irrigation: [150000, 470000],
};

export const machines: Machine[] = Array.from({ length: 34 }, (_, i) => {
  const category = at(CATEGORIES, i % CATEGORIES.length);
  const model = at(MODEL_ROOTS[category], i % MODEL_ROOTS[category].length);
  const brand = pick(BRANDS);
  const [lo, hi] = PRICE_BASE[category];
  const price = Math.round((lo + rng() * (hi - lo)) / 5000) * 5000;
  const availability = pick<Availability>([
    "Disponible",
    "Disponible",
    "Disponible",
    "Réservée",
    "Indisponible",
    "Prochainement",
  ]);
  return {
    id: `MCH-${1000 + i}`,
    name: `${brand} ${model}`,
    brand,
    model,
    category,
    year: between(2021, 2026),
    power: category === "Irrigation" ? `${between(15, 60)} kW` : `${between(90, 340)} CV`,
    capacity:
      category === "Moissonneuses"
        ? `${between(6, 12)} m de coupe`
        : category === "Pulvérisateurs"
          ? `${between(2000, 6000)} L`
          : category === "Semoirs"
            ? `${between(4, 12)} rangs`
            : `${between(2, 9)} t`,
    dimensions: `${(3 + rng() * 5).toFixed(1)} × ${(2 + rng() * 2).toFixed(1)} × ${(2.5 + rng() * 1.5).toFixed(1)} m`,
    weight: `${between(3, 18)} t`,
    usage: USAGES[category],
    price,
    vat: 20,
    city: pick(CITIES),
    country: rng() > 0.82 ? pick(COUNTRIES.slice(1)) : "Maroc",
    availability,
    stock: availability === "Disponible" ? between(1, 9) : availability === "Réservée" ? 1 : 0,
    image: CATEGORY_IMAGE[category],
    demand: between(24, 98),
    description: `${brand} ${model} — équipement ${category.toLowerCase().replace(/s$/, "")} de nouvelle génération, importé et préparé par nos ateliers. Motorisation conforme aux normes d'émission, cabine climatisée, télémétrie embarquée et suivi de maintenance connecté.`,
    features: [
      "Télémétrie embarquée & suivi GPS",
      "Cabine pressurisée et climatisée",
      "Garantie constructeur 24 mois",
      "Formation opérateur incluse",
      "Réseau de maintenance Maroc & Europe",
    ],
  };
});

export const machineById = (id: string) => machines.find((m) => m.id === id);

/* ------------------------------------------------------------------ */
/* Clients & prospects                                                 */
/* ------------------------------------------------------------------ */

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  initials: string;
  since: string;
  totalSpent: number;
  orders: number;
  segment: "Grand compte" | "PME" | "Coopérative" | "Exploitant";
  rep: string;
}

function person() {
  const first = pick(FIRST);
  const last = pick(LAST);
  return { first, last, name: `${first} ${last}`, initials: `${first[0]}${last[0]}` } as { first: string; last: string; name: string; initials: string };
}

export const clients: Client[] = Array.from({ length: 42 }, (_, i) => {
  const p = person();
  const company = `${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`;
  return {
    id: `CLI-${2000 + i}`,
    name: p.name,
    company,
    email: `${p.first.toLowerCase()}.${p.last.toLowerCase().replace(/[^a-z]/g, "")}@${(company.split(" ")[1] ?? company).toLowerCase().replace(/[^a-z]/g, "")}.ma`,
    phone: `+212 6 ${between(10, 79)} ${between(10, 99)} ${between(10, 99)} ${between(10, 99)}`,
    city: pick(CITIES),
    country: rng() > 0.85 ? pick(COUNTRIES.slice(1)) : "Maroc",
    initials: p.initials,
    since: daysAgo(between(60, 900)),
    totalSpent: between(2, 42) * 125000,
    orders: between(1, 12),
    segment: pick(["Grand compte", "PME", "Coopérative", "Exploitant"] as const),
    rep: pick(SALES_REPS).name,
  };
});

export const clientById = (id: string) => clients.find((c) => c.id === id);

export type LeadStatus =
  | "Nouveau"
  | "Contacté"
  | "Qualifié"
  | "Proposition"
  | "Négociation"
  | "Gagné"
  | "Perdu";

export const LEAD_STATUSES: LeadStatus[] = [
  "Nouveau",
  "Contacté",
  "Qualifié",
  "Proposition",
  "Négociation",
  "Gagné",
  "Perdu",
];

export interface Prospect {
  id: string;
  name: string;
  company: string;
  initials: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  source: Channel;
  score: number;
  temperature: "Chaud" | "Tiède" | "Froid";
  interest: Category;
  machineId: string;
  budgetMin: number;
  budgetMax: number;
  horizon: string;
  rep: string;
  status: LeadStatus;
  lastInteraction: string;
  createdAt: string;
  notes: string;
  aiSummary: string;
}

export const prospects: Prospect[] = Array.from({ length: 84 }, (_, i) => {
  const p = person();
  const machine = at(machines, between(0, machines.length - 1));
  const score = between(28, 98);
  const budgetMin = Math.round((machine.price * 0.85) / 10000) * 10000;
  const company = `${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`;
  return {
    id: `PRS-${3000 + i}`,
    name: p.name,
    company,
    initials: p.initials,
    email: `${p.first.toLowerCase()}.${p.last.toLowerCase().replace(/[^a-z]/g, "")}@mail.ma`,
    phone: `+212 6 ${between(10, 79)} ${between(10, 99)} ${between(10, 99)} ${between(10, 99)}`,
    city: pick(CITIES),
    country: rng() > 0.88 ? pick(COUNTRIES.slice(1)) : "Maroc",
    source: pick(CHANNELS),
    score,
    temperature: score >= 75 ? "Chaud" : score >= 50 ? "Tiède" : "Froid",
    interest: machine.category,
    machineId: machine.id,
    budgetMin,
    budgetMax: Math.round((machine.price * 1.15) / 10000) * 10000,
    horizon: pick(["Moins de 30 jours", "1 à 3 mois", "3 à 6 mois", "Plus de 6 mois"]),
    rep: pick(SALES_REPS).name,
    status: pick(LEAD_STATUSES),
    lastInteraction: daysAgo(between(0, 40)),
    createdAt: daysAgo(between(1, 120)),
    notes: "Exploitation en phase de modernisation, remplacement de matériel vieillissant.",
    aiSummary: `Besoin détecté : ${machine.category.replace(/s$/, "")} ${machine.power}. Budget cohérent avec l'offre ${machine.name}. Décision attendue sous ${score >= 75 ? "30 jours" : "3 mois"}.`,
  };
});

export const prospectById = (id: string) => prospects.find((p) => p.id === id);

/* ------------------------------------------------------------------ */
/* Demandes, devis, commandes, paiements, factures                     */
/* ------------------------------------------------------------------ */

export type RequestStatus = "Nouvelle" | "En cours" | "Qualifiée" | "Devis envoyé" | "Clôturée";

export interface DemandeItem {
  id: string;
  clientId: string;
  clientName: string;
  company: string;
  machineId: string;
  machineName: string;
  quantity: number;
  city: string;
  budget: number;
  priority: "Haute" | "Moyenne" | "Basse";
  rep: string;
  status: RequestStatus;
  createdAt: string;
  message: string;
}

export const demandes: DemandeItem[] = Array.from({ length: 46 }, (_, i) => {
  const client = at(clients, between(0, clients.length - 1));
  const machine = at(machines, between(0, machines.length - 1));
  const quantity = between(1, 3);
  return {
    id: `DEM-${4000 + i}`,
    clientId: client.id,
    clientName: client.name,
    company: client.company,
    machineId: machine.id,
    machineName: machine.name,
    quantity,
    city: client.city,
    budget: machine.price * quantity,
    priority: pick(["Haute", "Moyenne", "Basse"] as const),
    rep: client.rep,
    status: pick(["Nouvelle", "En cours", "Qualifiée", "Devis envoyé", "Clôturée"] as const),
    createdAt: daysAgo(between(0, 60)),
    message: `Bonjour, nous souhaitons recevoir une proposition pour ${quantity} unité(s) de ${machine.name} livrée(s) à ${client.city}.`,
  };
});

export type QuoteStatus = "Brouillon" | "Envoyé" | "En négociation" | "Accepté" | "Refusé" | "Expiré";

export interface Quote {
  id: string;
  clientId: string;
  clientName: string;
  company: string;
  machineId: string;
  machineName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vat: number;
  delivery: number;
  subtotal: number;
  total: number;
  status: QuoteStatus;
  createdAt: string;
  validUntil: string;
  rep: string;
  paymentTerms: string;
}

function computeQuote(unitPrice: number, quantity: number, discount: number, delivery: number) {
  const gross = unitPrice * quantity;
  const subtotal = gross - (gross * discount) / 100 + delivery;
  return { subtotal, total: subtotal * 1.2 };
}

export const quotes: Quote[] = Array.from({ length: 54 }, (_, i) => {
  const client = at(clients, between(0, clients.length - 1));
  const machine = at(machines, between(0, machines.length - 1));
  const quantity = between(1, 3);
  const discount = pick([0, 2, 3, 5, 7, 10]);
  const delivery = between(4, 24) * 1000;
  const { subtotal, total } = computeQuote(machine.price, quantity, discount, delivery);
  const createdAt = daysAgo(between(1, 90));
  return {
    id: `DEV-${2000 + i}`,
    clientId: client.id,
    clientName: client.name,
    company: client.company,
    machineId: machine.id,
    machineName: machine.name,
    quantity,
    unitPrice: machine.price,
    discount,
    vat: 20,
    delivery,
    subtotal,
    total,
    status: pick(["Brouillon", "Envoyé", "En négociation", "Accepté", "Refusé", "Expiré"] as const),
    createdAt,
    validUntil: new Date(new Date(createdAt).getTime() + 30 * DAY).toISOString(),
    rep: client.rep,
    paymentTerms: pick(["30 % à la commande, solde à la livraison", "Paiement à 30 jours", "Paiement comptant", "Leasing 36 mois"]),
  };
});

export type OrderStatus =
  | "En attente"
  | "Confirmée"
  | "Paiement en attente"
  | "Payée"
  | "En préparation"
  | "Livrée"
  | "Terminée"
  | "Annulée";

export const ORDER_STATUSES: OrderStatus[] = [
  "En attente",
  "Confirmée",
  "Paiement en attente",
  "Payée",
  "En préparation",
  "Livrée",
  "Terminée",
  "Annulée",
];

export interface Order {
  id: string;
  quoteId: string;
  clientId: string;
  clientName: string;
  company: string;
  machineId: string;
  machineName: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveryCity: string;
  rep: string;
}

const acceptedQuotes = quotes.filter((q) => q.status === "Accepté");
const orderSeeds = acceptedQuotes.length >= 32 ? acceptedQuotes.slice(0, 32) : quotes.slice(0, 32);

export const orders: Order[] = orderSeeds.map((q, i) => ({
  id: `CMD-${2000 + i}`,
  quoteId: q.id,
  clientId: q.clientId,
  clientName: q.clientName,
  company: q.company,
  machineId: q.machineId,
  machineName: q.machineName,
  quantity: q.quantity,
  total: q.total,
  status: pick(ORDER_STATUSES.slice(0, 7)),
  createdAt: daysAgo(between(0, 70)),
  deliveryCity: pick(CITIES),
  rep: q.rep,
}));

export type PaymentStatus = "En attente" | "Initié" | "Payé" | "Échoué" | "Remboursé";

export interface Payment {
  id: string;
  orderId: string;
  clientName: string;
  company: string;
  amount: number;
  method: "Virement bancaire" | "Chèque" | "Carte bancaire" | "Leasing";
  status: PaymentStatus;
  date: string;
}

export const payments: Payment[] = orders.map((o, i) => ({
  id: `PAY-${5000 + i}`,
  orderId: o.id,
  clientName: o.clientName,
  company: o.company,
  amount: o.total * pick([0.3, 0.5, 1]),
  method: pick(["Virement bancaire", "Chèque", "Carte bancaire", "Leasing"] as const),
  status: pick(["En attente", "Initié", "Payé", "Payé", "Payé", "Échoué", "Remboursé"] as const),
  date: daysAgo(between(0, 60)),
}));

export type InvoiceStatus = "Émise" | "Payée" | "En retard" | "Annulée";

export interface Invoice {
  id: string;
  orderId: string;
  clientId: string;
  clientName: string;
  company: string;
  date: string;
  dueDate: string;
  amountHT: number;
  vat: number;
  amountTTC: number;
  status: InvoiceStatus;
}

export const invoices: Invoice[] = orders.map((o, i) => {
  const ht = o.total / 1.2;
  const date = daysAgo(between(0, 60));
  return {
    id: `FAC-${7000 + i}`,
    orderId: o.id,
    clientId: o.clientId,
    clientName: o.clientName,
    company: o.company,
    date,
    dueDate: new Date(new Date(date).getTime() + 30 * DAY).toISOString(),
    amountHT: ht,
    vat: ht * 0.2,
    amountTTC: o.total,
    status: pick(["Émise", "Payée", "Payée", "En retard", "Annulée"] as const),
  };
});

/* ------------------------------------------------------------------ */
/* Conversations IA                                                    */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  role: "ai" | "user" | "agent";
  text: string;
  time: string;
  intent?: string;
}

export interface Conversation {
  id: string;
  prospectId: string;
  prospectName: string;
  company: string;
  initials: string;
  channel: Channel;
  city: string;
  score: number;
  status: "Active" | "Qualifiée" | "Transférée" | "Clôturée";
  updatedAt: string;
  unread: number;
  messages: ChatMessage[];
  extracted: { label: string; value: string; done: boolean }[];
  recommended: string[];
}

export const conversations: Conversation[] = Array.from({ length: 24 }, (_, i) => {
  const p = at(prospects, i * 3);
  const machine = machineById(p.machineId)!;
  const alt = machines.filter((m) => m.category === machine.category && m.id !== machine.id).slice(0, 2);
  const t = (min: number) => new Date(NOW - min * 60000).toISOString();
  return {
    id: `CNV-${6000 + i}`,
    prospectId: p.id,
    prospectName: p.name,
    company: p.company,
    initials: p.initials,
    channel: p.source,
    city: p.city,
    score: p.score,
    status: pick(["Active", "Qualifiée", "Transférée", "Clôturée"] as const),
    updatedAt: daysAgo(between(0, 12)),
    unread: between(0, 4),
    messages: [
      {
        role: "ai",
        text: `Bonjour ${p.name.split(" ")[0]}, je suis Amira, votre assistante commerciale AgriMach. Sur quel type d'exploitation travaillez-vous ?`,
        time: t(240),
      },
      {
        role: "user",
        text: `Bonjour, nous exploitons 320 hectares de céréales dans la région de ${p.city}.`,
        time: t(236),
        intent: "Découverte activité",
      },
      {
        role: "ai",
        text: "Merci. Quel équipement recherchez-vous en priorité pour cette campagne ?",
        time: t(234),
      },
      {
        role: "user",
        text: `Nous cherchons ${machine.category === "Tracteurs" ? "un tracteur d'environ 180 CV" : `un équipement de type ${machine.category.toLowerCase()}`}, notre matériel actuel arrive en fin de vie.`,
        time: t(230),
        intent: "Besoin identifié",
      },
      {
        role: "ai",
        text: `Compris. Quel budget avez-vous prévu pour cet investissement ?`,
        time: t(228),
      },
      {
        role: "user",
        text: `Entre ${formatMAD(p.budgetMin)} et ${formatMAD(p.budgetMax)}, avec un financement possible.`,
        time: t(224),
        intent: "Budget confirmé",
      },
      {
        role: "ai",
        text: `Parfait. Au vu de votre surface et de votre budget, je vous recommande le ${machine.name} (${machine.power}, disponible à ${machine.city}). Souhaitez-vous recevoir un devis détaillé ?`,
        time: t(220),
      },
      {
        role: "user",
        text: "Oui, envoyez-moi une proposition. Nous décidons dans les prochaines semaines.",
        time: t(216),
        intent: "Intention d'achat forte",
      },
    ],
    extracted: [
      { label: "Nom", value: p.name, done: true },
      { label: "Entreprise", value: p.company, done: true },
      { label: "Ville", value: p.city, done: true },
      { label: "Besoin", value: machine.category, done: true },
      { label: "Budget", value: `${formatMAD(p.budgetMin)} – ${formatMAD(p.budgetMax)}`, done: true },
      { label: "Délai", value: p.horizon, done: p.score > 55 },
      { label: "Machine", value: machine.name, done: true },
    ],
    recommended: [machine.id, ...alt.map((m) => m.id)],
  };
});

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août"];

export const salesSeries = MONTHS.map((m, i) => ({
  month: m,
  ca: 380 + i * 42 + between(0, 90),
  objectif: 420 + i * 38,
  devis: between(18, 46),
}));

export const funnelSeries = [
  { stage: "Leads", value: 486 },
  { stage: "Qualifiés", value: 214 },
  { stage: "Devis", value: 118 },
  { stage: "Commandes", value: 52 },
];

export const sourceSeries = CHANNELS.map((c) => ({ source: c, leads: between(38, 160) }));

export const citySeries = CITIES.map((c) => ({ city: c, demandes: between(12, 84) }));

export const repSeries = SALES_REPS.map((r) => ({
  rep: r.name.split(" ")[0],
  ca: between(420, 1180),
  taux: between(18, 46),
}));

export const aiInsights = [
  "Les tracteurs représentent actuellement 43 % des demandes entrantes.",
  "Tanger présente le meilleur taux de conversion du réseau (38,2 %).",
  "8 leads chauds attendent encore un premier contact commercial.",
  "Les devis avec remise supérieure à 7 % se transforment 1,8× plus vite.",
];

export const dayActions = [
  { type: "Relance", label: "Relancer Domaine Al Baraka — devis DEV-2018", due: "10:30", priority: "Haute" },
  { type: "Devis", label: "Envoyer le devis moissonneuse à Coopérative Souss", due: "11:15", priority: "Haute" },
  { type: "Rendez-vous", label: "Visite technique — Ferme Gharb, Kénitra", due: "14:00", priority: "Moyenne" },
  { type: "Lead", label: "Contacter 3 leads chauds issus de WhatsApp", due: "16:00", priority: "Haute" },
];

export const notifications = [
  { icon: "lead", text: "Nouveau lead qualifié depuis le site web.", time: "il y a 4 min" },
  { icon: "quote", text: "Ahmed Benali a demandé un devis pour un tracteur X180 Pro.", time: "il y a 22 min" },
  { icon: "payment", text: "Paiement de 245 000 MAD reçu — commande CMD-2011.", time: "il y a 1 h" },
  { icon: "alert", text: "Le devis DEV-2048 expire demain.", time: "il y a 3 h" },
  { icon: "stock", text: "Moissonneuse Harvest 9200 bientôt en rupture de disponibilité.", time: "hier" },
];

/* ------------------------------------------------------------------ */
/* Fournisseurs & approvisionnement                                    */
/* ------------------------------------------------------------------ */

export interface Supplier {
  id: string;
  name: string;
  brands: string[];
  contactName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  incoterm: string;
  leadTimeDays: number;
  paymentTerms: string;
  rating: number;
  since: string;
}

export const suppliers: Supplier[] = [
  {
    id: "FRN-100",
    name: "AgriMech Europe SA",
    brands: ["AgriMech", "TerraPro"],
    contactName: "Lucas Meyer",
    email: "achats@agrimech-europe.com",
    phone: "+33 4 72 55 18 90",
    city: "Lyon",
    country: "France",
    incoterm: "CIF Casablanca",
    leadTimeDays: 45,
    paymentTerms: "30 % à la commande, solde à l'expédition",
    rating: 4.8,
    since: "2018",
  },
  {
    id: "FRN-101",
    name: "TerraPro Iberica",
    brands: ["TerraPro", "FieldMaster"],
    contactName: "Ana Ferrer",
    email: "compras@terrapro-iberica.es",
    phone: "+34 96 331 44 21",
    city: "Valence",
    country: "Espagne",
    incoterm: "FOB Valence",
    leadTimeDays: 30,
    paymentTerms: "Virement à 45 jours",
    rating: 4.5,
    since: "2020",
  },
  {
    id: "FRN-102",
    name: "Harvest Industries GmbH",
    brands: ["HarvestLine", "GrainTech"],
    contactName: "Jonas Richter",
    email: "orders@harvest-industries.de",
    phone: "+49 511 22 88 40",
    city: "Hanovre",
    country: "Allemagne",
    incoterm: "CIF Tanger Med",
    leadTimeDays: 60,
    paymentTerms: "Lettre de crédit irrévocable",
    rating: 4.9,
    since: "2016",
  },
  {
    id: "FRN-103",
    name: "Atlas Agri Équipement",
    brands: ["AtlasAgri", "IrriMax"],
    contactName: "Youssef Amrani",
    email: "commandes@atlasagri.ma",
    phone: "+212 5 22 47 11 08",
    city: "Casablanca",
    country: "Maroc",
    incoterm: "Franco dépôt",
    leadTimeDays: 12,
    paymentTerms: "Chèque à 60 jours",
    rating: 4.3,
    since: "2019",
  },
  {
    id: "FRN-104",
    name: "IrriMax Solutions",
    brands: ["IrriMax", "AquaField"],
    contactName: "Sara El Fassi",
    email: "supply@irrimax.ma",
    phone: "+212 5 37 68 92 14",
    city: "Rabat",
    country: "Maroc",
    incoterm: "Franco chantier",
    leadTimeDays: 18,
    paymentTerms: "50 % acompte, solde à la livraison",
    rating: 4.6,
    since: "2021",
  },
];

export interface PurchaseLine {
  machineId: string;
  machineName: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  recipient: string;
  subject: string;
  message: string;
  lines: PurchaseLine[];
  totalHT: number;
  vat: number;
  totalTTC: number;
  expectedDate: string;
  deliverySite: string;
  status: "Envoyé" | "Brouillon" | "Confirmé" | "Reçu";
  createdAt: string;
}
