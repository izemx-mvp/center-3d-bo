import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Boxes,
  Truck,
  ChevronDown,
  ChevronLeft,
  Headset,
  FileText,
  Gauge,
  Inbox,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Moon,
  PanelLeft,
  Radio,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sun,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-state";
import { BrandLockup, BrandMark } from "@/components/brand";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GlobalSearch } from "@/components/GlobalSearch";
import { notifications } from "@/lib/data";

const NAV: { group: string; items: { to: string; label: string; icon: typeof Gauge; badge?: string }[] }[] = [
  {
    group: "Pilotage",
    items: [
      { to: "/admin", label: "Dashboard", icon: Gauge },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    group: "Commercial",
    items: [
      { to: "/admin/prospects", label: "Prospects", icon: Target, badge: "84" },
      { to: "/admin/clients", label: "Clients", icon: Users },
      { to: "/admin/conversations", label: "Conversations IA", icon: MessageSquare, badge: "6" },
      { to: "/admin/communication", label: "Communication", icon: Radio },
    ],
  },
  {
    group: "Offre",
    items: [
      { to: "/admin/catalogue", label: "Catalogue", icon: LayoutGrid },
      { to: "/admin/fournisseurs", label: "Fournisseurs & stock", icon: Truck },
    ],
  },
  {
    group: "Ventes",
    items: [
      { to: "/admin/demandes", label: "Demandes", icon: Inbox, badge: "12" },
      { to: "/admin/devis", label: "Devis", icon: FileText },
      { to: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
      { to: "/admin/paiements", label: "Paiements", icon: Wallet },
      { to: "/admin/factures", label: "Factures", icon: Receipt },
    ],
  },
  {
    group: "Système",
    items: [{ to: "/admin/administration", label: "Administration", icon: ShieldCheck }],
  },
];

function NavLinks({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/admin" ? pathname === "/admin" : pathname.startsWith(to));
  const activeGroup = NAV.find((g) => g.items.some((i) => isActive(i.to)))?.group;
  const [closed, setClosed] = useState<string[]>([]);

  return (
    <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
      {NAV.map((group) => {
        const open = collapsed || !closed.includes(group.group) || group.group === activeGroup;
        return (
          <div key={group.group}>
            {!collapsed && (
              <button
                type="button"
                aria-expanded={open}
                onClick={() =>
                  setClosed((c) => (c.includes(group.group) ? c.filter((g) => g !== group.group) : [...c, group.group]))
                }
                className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/80"
              >
                <span className="truncate">{group.group}</span>
                <ChevronDown className={cn("ml-auto h-3.5 w-3.5 transition-transform duration-200", !open && "-rotate-90")} />
              </button>
            )}
            <ul className={cn("space-y-1 overflow-hidden transition-all duration-200", !open && "hidden")}>
              {group.items.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                const link = (
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                    )}
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        active ? "text-sidebar-primary" : "text-sidebar-foreground/60",
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto rounded-full bg-sidebar-primary/15 px-2 py-0.5 text-[10px] font-semibold text-sidebar-primary">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
                return (
                  <li key={item.to}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right">
                          {item.label}
                          {item.badge ? ` · ${item.badge}` : ""}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, ready, logout, theme, toggleTheme, lang, setLang } = useApp();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (ready && (!user || user.space !== "admin")) {
      navigate({ to: "/login/admin" });
    }
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <BrandMark className="animate-pulse" />
          <p className="text-sm text-muted-foreground">Chargement de votre espace…</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        <AmbientBackground variant="surface" />

        {/* Sidebar desktop */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 lg:flex",
            collapsed ? "w-[76px]" : "w-[260px]",
          )}
        >
          <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
            <Link to="/admin" className="text-sidebar-foreground">
              <BrandLockup compact={collapsed} onDark subtitle="Espace commercial" />
            </Link>
          </div>
          <NavLinks collapsed={collapsed} />
          <div className="border-t border-sidebar-border p-3">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
              {!collapsed && "Réduire"}
            </button>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className={cn(
                "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/15 hover:text-destructive",
                collapsed && "justify-center px-0",
              )}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && "Déconnexion"}
            </button>
          </div>
        </aside>

        <div className={cn("transition-[padding] duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]")}>
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl md:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir la navigation">
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[270px] border-sidebar-border bg-sidebar p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-16 items-center border-b border-sidebar-border px-4 text-sidebar-foreground">
                  <BrandLockup subtitle="Espace commercial" />
                </div>
                <NavLinks collapsed={false} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <button
              onClick={() => setSearchOpen(true)}
              className="group flex h-10 flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 md:max-w-md"
            >
              <Search className="h-4 w-4" />
              <span className="truncate">Rechercher un client, une machine, un devis...</span>
              <kbd className="ml-auto hidden rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] md:inline">
                ⌘K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden text-xs font-semibold sm:inline-flex">
                    {lang}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(["FR", "EN", "AR"] as const).map((l) => (
                    <DropdownMenuItem key={l} onClick={() => setLang(l)}>
                      {l === "FR" ? "Français" : l === "EN" ? "English" : "العربية"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Changer de thème">
                    {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{theme === "dark" ? "Mode clair" : "Mode sombre"}</TooltipContent>
              </Tooltip>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                    <Bell className="h-[18px] w-[18px]" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-glow ring-2 ring-background" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[340px] p-0">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="font-display text-sm font-semibold">Notifications</p>
                    <Badge variant="secondary" className="text-[10px]">5 nouvelles</Badge>
                  </div>
                  <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                    {notifications.map((n, i) => (
                      <li key={i} className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {n.icon === "payment" ? (
                            <Wallet className="h-4 w-4" />
                          ) : n.icon === "quote" ? (
                            <FileText className="h-4 w-4" />
                          ) : n.icon === "stock" ? (
                            <Boxes className="h-4 w-4" />
                          ) : (
                            <Target className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm leading-snug">{n.text}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 transition-colors hover:bg-surface">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="gradient-primary text-[11px] font-semibold text-primary-foreground">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-left leading-tight md:block">
                      <span className="block text-xs font-semibold">{user.name}</span>
                      <span className="block text-[10px] text-muted-foreground">{user.role}</span>
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" /> Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" /> Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      logout();
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="px-4 py-6 md:px-6 lg:px-8">{children}</main>
        </div>

        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </TooltipProvider>
  );
}
