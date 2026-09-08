import { quoteTotals } from "./quote-doc";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  clients as seedClients,
  demandes as seedDemandes,
  invoices as seedInvoices,
  orders as seedOrders,
  payments as seedPayments,
  prospects as seedProspects,
  quotes as seedQuotes,
  machines,
  suppliers as seedSuppliers,
  serviceOffers as seedServices,
  faqItems as seedFaqs,
  documentItems as seedDocuments,
  type DemandeItem,
  type DocumentItem,
  type FaqItem,
  type Invoice,
  type Machine,
  type Order,
  type Payment,
  type Prospect,
  type PurchaseOrder,
  type Quote,
  type ServiceOffer,
  type Supplier,
} from "./data";

/* ---------------- Auth ---------------- */

export type Space = "admin" | "client";

export interface SessionUser {
  space: Space;
  name: string;
  email: string;
  role: string;
  initials: string;
  clientId?: string;
}

const CREDENTIALS: Record<Space, { email: string; password: string; user: SessionUser }> = {
  admin: {
    email: "admin@agri-platform.demo",
    password: "Admin123!",
    user: {
      space: "admin",
      name: "Mohamed Chraibi",
      email: "admin@agri-platform.demo",
      role: "Directeur commercial",
      initials: "MC",
    },
  },
  client: {
    email: "client@agri-platform.demo",
    password: "Client123!",
    user: {
      space: "client",
      name: "Ahmed Benali",
      email: "client@agri-platform.demo",
      role: "Domaine Al Baraka · Kénitra",
      initials: "AB",
      clientId: seedClients[0]!.id,
    },
  },
};

const STORAGE_KEY = "agrimach.session";

interface AppContextValue {
  user: SessionUser | null;
  ready: boolean;
  login: (space: Space, email: string, password: string) => Promise<SessionUser>;
  logout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  lang: "FR" | "EN" | "AR";
  setLang: (l: "FR" | "EN" | "AR") => void;
  prospects: Prospect[];
  demandes: DemandeItem[];
  quotes: Quote[];
  orders: Order[];
  payments: Payment[];
  invoices: Invoice[];
  favorites: string[];
  compare: string[];
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string) => void;
  createDemande: (input: { machineId: string; quantity: number; city: string; message: string; budget: number }) => DemandeItem;
  createQuote: (input: Omit<Quote, "id" | "createdAt" | "validUntil" | "subtotal" | "total">) => Quote;
  updateQuoteStatus: (id: string, status: Quote["status"]) => void;
  updateQuotePricing: (
    id: string,
    patch: Partial<Pick<Quote, "unitPrice" | "quantity" | "discount" | "delivery" | "vat" | "paymentTerms" | "validUntil">>,
  ) => void;
  convertQuoteToOrder: (quoteId: string) => Order | undefined;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  registerPayment: (orderId: string, amount: number) => Payment | undefined;
  generateInvoice: (orderId: string) => Invoice | undefined;
  updateProspectStatus: (id: string, status: Prospect["status"]) => void;
  catalogue: Machine[];
  suppliers: Supplier[];
  addSupplier: (input: Omit<Supplier, "id">) => Supplier;
  updateSupplier: (id: string, patch: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  purchaseOrders: PurchaseOrder[];
  addMachine: (input: Omit<Machine, "id" | "demand">) => Machine;
  updateMachine: (id: string, patch: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  createPurchaseOrder: (
    input: Omit<PurchaseOrder, "id" | "createdAt" | "totalHT" | "vat" | "totalTTC" | "status"> & {
      status?: PurchaseOrder["status"];
    },
  ) => PurchaseOrder;
  services: ServiceOffer[];
  faqs: FaqItem[];
  documents: DocumentItem[];
  addService: (input: Omit<ServiceOffer, "id">) => ServiceOffer;
  updateService: (id: string, patch: Partial<ServiceOffer>) => void;
  deleteService: (id: string) => void;
  addFaq: (input: Omit<FaqItem, "id" | "views" | "updatedAt">) => FaqItem;
  updateFaq: (id: string, patch: Partial<FaqItem>) => void;
  deleteFaq: (id: string) => void;
  addDocument: (input: Omit<DocumentItem, "id" | "updatedAt">) => DocumentItem;
  updateDocument: (id: string, patch: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;
  /* Panier client */
  cart: CartLine[];
  addToCart: (machineId: string, quantity?: number) => void;
  setCartQuantity: (machineId: string, quantity: number) => void;
  removeFromCart: (machineId: string) => void;
  clearCart: () => void;
  submitCartDemande: (input: { city: string; message: string }) => DemandeItem[];
  checkoutCart: (input: { city: string; method: Payment["method"] }) => { orders: Order[]; invoices: Invoice[]; total: number };
}

export interface CartLine {
  machineId: string;
  quantity: number;
}

const CART_KEY = "agrimach.cart";

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<"FR" | "EN" | "AR">("FR");

  const [services, setServices] = useState<ServiceOffer[]>(seedServices);
  const [faqs, setFaqs] = useState<FaqItem[]>(seedFaqs);
  const [documents, setDocuments] = useState<DocumentItem[]>(seedDocuments);

  const [prospects, setProspects] = useState<Prospect[]>(seedProspects);
  const [demandes, setDemandes] = useState<DemandeItem[]>(seedDemandes);
  const [quotes, setQuotes] = useState<Quote[]>(seedQuotes);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [payments, setPayments] = useState<Payment[]>(seedPayments);
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [catalogue, setCatalogue] = useState<Machine[]>(machines);
  const [suppliers, setSuppliers] = useState<Supplier[]>(seedSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as SessionUser);
      const storedTheme = localStorage.getItem("agrimach.theme");
      if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);
      const storedCart = localStorage.getItem(CART_KEY);
      if (storedCart) setCart(JSON.parse(storedCart) as CartLine[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, ready]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("agrimach.theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const login = useCallback(async (space: Space, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 1100));
    const creds = CREDENTIALS[space];
    if (email.trim().toLowerCase() !== creds.email || password !== creds.password) {
      throw new Error("Identifiants incorrects. Utilisez le compte de démonstration.");
    }
    setUser(creds.user);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(creds.user));
    } catch {
      /* ignore */
    }
    return creds.user;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      ready,
      login,
      logout,
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      lang,
      setLang,
      prospects,
      demandes,
      quotes,
      orders,
      payments,
      invoices,
      favorites,
      compare,
      toggleFavorite: (id) =>
        setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
      toggleCompare: (id) =>
        setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(-3))),
      createDemande: (input) => {
        const machine = machines.find((m) => m.id === input.machineId)!;
        const client = seedClients[0]!;
        const demande: DemandeItem = {
          id: `DEM-${4500 + demandes.length}`,
          clientId: client.id,
          clientName: "Ahmed Benali",
          company: "Domaine Al Baraka",
          machineId: machine.id,
          machineName: machine.name,
          quantity: input.quantity,
          city: input.city,
          budget: input.budget,
          priority: "Haute",
          rep: client.rep,
          status: "Nouvelle",
          createdAt: new Date().toISOString(),
          message: input.message,
        };
        setDemandes((d) => [demande, ...d]);
        return demande;
      },
      createQuote: (input) => {
        const gross = input.unitPrice * input.quantity;
        const subtotal = gross - (gross * input.discount) / 100 + input.delivery;
        const quote: Quote = {
          ...input,
          id: `DEV-${2100 + quotes.length}`,
          subtotal,
          total: subtotal * (1 + input.vat / 100),
          createdAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
        };
        setQuotes((q) => [quote, ...q]);
        return quote;
      },
      updateQuoteStatus: (id, status) =>
        setQuotes((qs) => qs.map((q) => (q.id === id ? { ...q, status } : q))),
      updateQuotePricing: (id, patch) =>
        setQuotes((qs) =>
          qs.map((q) => {
            if (q.id !== id) return q;
            const next = { ...q, ...patch };
            const { subtotal, total } = quoteTotals(next);
            return { ...next, subtotal, total };
          }),
        ),
      convertQuoteToOrder: (quoteId) => {
        const q = quotes.find((x) => x.id === quoteId);
        if (!q) return undefined;
        const order: Order = {
          id: `CMD-${2100 + orders.length}`,
          quoteId: q.id,
          clientId: q.clientId,
          clientName: q.clientName,
          company: q.company,
          machineId: q.machineId,
          machineName: q.machineName,
          quantity: q.quantity,
          total: q.total,
          status: "Confirmée",
          createdAt: new Date().toISOString(),
          deliveryCity: "Rabat",
          rep: q.rep,
        };
        setOrders((o) => [order, ...o]);
        setQuotes((qs) => qs.map((x) => (x.id === quoteId ? { ...x, status: "Accepté" } : x)));
        return order;
      },
      updateOrderStatus: (id, status) =>
        setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o))),
      registerPayment: (orderId, amount) => {
        const order = orders.find((o) => o.id === orderId);
        if (!order) return undefined;
        const payment: Payment = {
          id: `PAY-${5500 + payments.length}`,
          orderId,
          clientName: order.clientName,
          company: order.company,
          amount,
          method: "Virement bancaire",
          status: "Payé",
          date: new Date().toISOString(),
        };
        setPayments((p) => [payment, ...p]);
        setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, status: "Payée" } : o)));
        return payment;
      },
      generateInvoice: (orderId) => {
        const order = orders.find((o) => o.id === orderId);
        if (!order) return undefined;
        const ht = order.total / 1.2;
        const invoice: Invoice = {
          id: `FAC-${7500 + invoices.length}`,
          orderId,
          clientId: order.clientId,
          clientName: order.clientName,
          company: order.company,
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
          amountHT: ht,
          vat: ht * 0.2,
          amountTTC: order.total,
          status: "Émise",
        };
        setInvoices((inv) => [invoice, ...inv]);
        return invoice;
      },
      updateProspectStatus: (id, status) =>
        setProspects((ps) => ps.map((p) => (p.id === id ? { ...p, status } : p))),
      catalogue,
      suppliers,
      addSupplier: (input) => {
        const supplier: Supplier = { ...input, id: `FRN-${200 + suppliers.length}` };
        setSuppliers((list) => [supplier, ...list]);
        return supplier;
      },
      updateSupplier: (id, patch) => setSuppliers((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s))),
      deleteSupplier: (id) => setSuppliers((list) => list.filter((s) => s.id !== id)),
      purchaseOrders,
      addMachine: (input) => {
        const machine: Machine = { ...input, id: `MCH-${2000 + catalogue.length}`, demand: 50 };
        setCatalogue((c) => [machine, ...c]);
        return machine;
      },
      updateMachine: (id, patch) =>
        setCatalogue((c) => c.map((m) => (m.id === id ? { ...m, ...patch } : m))),
      deleteMachine: (id) => setCatalogue((c) => c.filter((m) => m.id !== id)),
      adjustStock: (id, delta) =>
        setCatalogue((c) =>
          c.map((m) => {
            if (m.id !== id) return m;
            const stock = Math.max(0, m.stock + delta);
            return {
              ...m,
              stock,
              availability: stock === 0 ? "Indisponible" : m.availability === "Indisponible" ? "Disponible" : m.availability,
            };
          }),
        ),
      createPurchaseOrder: (input) => {
        const totalHT = input.lines.reduce((s, l) => s + l.unitCost * l.quantity, 0);
        const vat = totalHT * 0.2;
        const po: PurchaseOrder = {
          ...input,
          status: input.status ?? "Envoyé",
          id: `BC-${3200 + purchaseOrders.length}`,
          totalHT,
          vat,
          totalTTC: totalHT + vat,
          createdAt: new Date().toISOString(),
        };
        setPurchaseOrders((p) => [po, ...p]);
        input.lines.forEach((l) => {
          setCatalogue((c) =>
            c.map((m) => (m.id === l.machineId ? { ...m, stock: m.stock + l.quantity, availability: "Prochainement" } : m)),
          );
        });
        return po;
      },
      services,
      faqs,
      documents,
      addService: (input) => {
        const service: ServiceOffer = { ...input, id: `SRV-${400 + services.length}` };
        setServices((s) => [service, ...s]);
        return service;
      },
      updateService: (id, patch) => setServices((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x))),
      deleteService: (id) => setServices((s) => s.filter((x) => x.id !== id)),
      addFaq: (input) => {
        const faq: FaqItem = { ...input, id: `FAQ-${500 + faqs.length}`, views: 0, updatedAt: new Date().toISOString() };
        setFaqs((f) => [faq, ...f]);
        return faq;
      },
      updateFaq: (id, patch) =>
        setFaqs((f) => f.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x))),
      deleteFaq: (id) => setFaqs((f) => f.filter((x) => x.id !== id)),
      addDocument: (input) => {
        const doc: DocumentItem = { ...input, id: `DOC-${600 + documents.length}`, updatedAt: new Date().toISOString() };
        setDocuments((d) => [doc, ...d]);
        return doc;
      },
      updateDocument: (id, patch) =>
        setDocuments((d) => d.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x))),
      deleteDocument: (id) => setDocuments((d) => d.filter((x) => x.id !== id)),
      cart,
      addToCart: (machineId, quantity = 1) =>
        setCart((c) =>
          c.some((l) => l.machineId === machineId)
            ? c.map((l) => (l.machineId === machineId ? { ...l, quantity: l.quantity + quantity } : l))
            : [...c, { machineId, quantity }],
        ),
      setCartQuantity: (machineId, quantity) =>
        setCart((c) => c.map((l) => (l.machineId === machineId ? { ...l, quantity: Math.max(1, quantity) } : l))),
      removeFromCart: (machineId) => setCart((c) => c.filter((l) => l.machineId !== machineId)),
      clearCart: () => setCart([]),
      submitCartDemande: ({ city, message }) => {
        const client = seedClients[0]!;
        const created: DemandeItem[] = [];
        cart.forEach((line, i) => {
          const machine = catalogue.find((m) => m.id === line.machineId);
          if (!machine) return;
          created.push({
            id: `DEM-${4500 + demandes.length + i}`,
            clientId: client.id,
            clientName: "Ahmed Benali",
            company: "Domaine Al Baraka",
            machineId: machine.id,
            machineName: machine.name,
            quantity: line.quantity,
            city,
            budget: machine.price * line.quantity,
            priority: "Haute",
            rep: client.rep,
            status: "Nouvelle",
            createdAt: new Date().toISOString(),
            message: message || `Demande groupée depuis le panier (${cart.length} références).`,
          });
        });
        setDemandes((d) => [...created, ...d]);
        setCart([]);
        return created;
      },
      checkoutCart: ({ city, method }) => {
        const client = seedClients[0]!;
        const now = new Date().toISOString();
        const newQuotes: Quote[] = [];
        const newOrders: Order[] = [];
        const newPayments: Payment[] = [];
        const newInvoices: Invoice[] = [];
        let total = 0;
        cart.forEach((line, i) => {
          const machine = catalogue.find((m) => m.id === line.machineId);
          if (!machine) return;
          const subtotal = machine.price * line.quantity;
          const ttc = subtotal * (1 + machine.vat / 100);
          total += ttc;
          const quote: Quote = {
            id: `DEV-${2100 + quotes.length + i}`,
            clientId: client.id,
            clientName: "Ahmed Benali",
            company: "Domaine Al Baraka",
            machineId: machine.id,
            machineName: machine.name,
            quantity: line.quantity,
            unitPrice: machine.price,
            discount: 0,
            vat: machine.vat,
            delivery: 0,
            subtotal,
            total: ttc,
            status: "Accepté",
            createdAt: now,
            validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
            rep: client.rep,
            paymentTerms: "Paiement en ligne — 100 % à la commande",
          };
          const order: Order = {
            id: `CMD-${2100 + orders.length + i}`,
            quoteId: quote.id,
            clientId: client.id,
            clientName: quote.clientName,
            company: quote.company,
            machineId: machine.id,
            machineName: machine.name,
            quantity: line.quantity,
            total: ttc,
            status: "Payée",
            createdAt: now,
            deliveryCity: city,
            rep: client.rep,
          };
          const payment: Payment = {
            id: `PAY-${5500 + payments.length + i}`,
            orderId: order.id,
            clientName: order.clientName,
            company: order.company,
            amount: ttc,
            method,
            status: "Payé",
            date: now,
          };
          const invoice: Invoice = {
            id: `FAC-${7500 + invoices.length + i}`,
            orderId: order.id,
            clientId: client.id,
            clientName: order.clientName,
            company: order.company,
            date: now,
            dueDate: now,
            amountHT: subtotal,
            vat: ttc - subtotal,
            amountTTC: ttc,
            status: "Payée",
          };
          newQuotes.push(quote);
          newOrders.push(order);
          newPayments.push(payment);
          newInvoices.push(invoice);
        });
        setQuotes((q) => [...newQuotes, ...q]);
        setOrders((o) => [...newOrders, ...o]);
        setPayments((p) => [...newPayments, ...p]);
        setInvoices((inv) => [...newInvoices, ...inv]);
        newOrders.forEach((o) =>
          setCatalogue((c) =>
            c.map((m) => {
              if (m.id !== o.machineId) return m;
              const stock = Math.max(0, m.stock - o.quantity);
              return { ...m, stock, availability: stock === 0 ? "Indisponible" : m.availability };
            }),
          ),
        );
        setCart([]);
        return { orders: newOrders, invoices: newInvoices, total };
      },
    }),
    [user, ready, login, logout, theme, lang, prospects, demandes, quotes, orders, payments, invoices, favorites, compare, catalogue, suppliers, purchaseOrders, services, faqs, documents, cart],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export const DEMO_CREDENTIALS = {
  admin: { email: CREDENTIALS.admin.email, password: CREDENTIALS.admin.password },
  client: { email: CREDENTIALS.client.email, password: CREDENTIALS.client.password },
};
