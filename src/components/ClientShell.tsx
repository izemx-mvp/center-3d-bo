import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Globe, LogOut, Menu, Moon, ShoppingCart, Sun, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-state";
import { BrandLockup, BrandMark } from "@/components/brand";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { notifications } from "@/lib/data";

const NAV = [
  { to: "/client", label: "Accueil" },
  { to: "/client/catalogue", label: "Catalogue" },
  { to: "/client/panier", label: "Panier" },
  { to: "/client/demandes", label: "Mes demandes" },
  { to: "/client/devis", label: "Mes devis" },
  { to: "/client/commandes", label: "Mes commandes" },
  { to: "/client/factures", label: "Mes factures" },
  { to: "/client/assistant", label: "Assistant IA" },
];

export function ClientShell({ children }: { children: ReactNode }) {
  const { user, ready, logout, theme, toggleTheme, lang, setLang, cart } = useApp();
  const cartCount = cart.reduce((s, l) => s + l.quantity, 0);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (ready && (!user || user.space !== "client")) {
      navigate({ to: "/login/client" });
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

  const isActive = (to: string) => (to === "/client" ? pathname === "/client" : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background">
      <AmbientBackground variant="surface" />

      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="border-b border-border p-4"><BrandLockup subtitle="Espace client" /></div>
              <nav className="flex flex-col gap-1 p-3">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive(n.to) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/60",
                    )}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/client" className="shrink-0"><BrandLockup subtitle="Espace client" /></Link>

          <nav className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(n.to) ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {n.label}
                {isActive(n.to) && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-primary" />}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative" aria-label="Mon panier" asChild>
              <Link to="/client/panier">
                <ShoppingCart className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full gradient-primary px-1 text-[10px] font-bold text-primary-foreground shadow-glow animate-rise-in">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Changer de thème">
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Globe className="h-4 w-4" /> {lang}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(["FR", "EN", "AR"] as const).map((l) => (
                  <DropdownMenuItem key={l} onClick={() => setLang(l)}>{l}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-[18px] w-[18px]" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <p className="border-b border-border px-4 py-3 text-sm font-semibold">Notifications</p>
                <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                  {notifications.map((n, i) => (
                    <li key={i} className="px-4 py-3">
                      <p className="text-sm">{n.text}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 transition-colors hover:bg-accent/60">
                  <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/10 text-xs text-primary">{user.initials}</AvatarFallback></Avatar>
                  <span className="hidden text-sm font-medium sm:inline">{user.name.split(" ")[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{user.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/client/profil"><User className="mr-2 h-4 w-4" /> Mon profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/" }); }}>
                  <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</main>
    </div>
  );
}
