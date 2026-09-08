import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/hero-tractor.jpg";
import clientImage from "@/assets/machine-moissonneuse.jpg";
import { AmbientBackground } from "@/components/AmbientBackground";
import { BrandLockup } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DEMO_CREDENTIALS, useApp, type Space } from "@/lib/app-state";

interface Props {
  space: Space;
}

const COPY = {
  admin: {
    title: "Bienvenue dans votre espace commercial",
    subtitle: "Connectez-vous pour piloter vos ventes, vos prospects et vos machines.",
    cta: "Se connecter",
    quote: "Pilotez toute votre activité commerciale depuis une seule plateforme.",
    image: heroImage,
    imageAlt: "Tracteur moderne dans un champ au coucher du soleil",
    redirect: "/admin",
  },
  client: {
    title: "Bienvenue dans votre espace client",
    subtitle: "Retrouvez votre catalogue, vos devis, commandes et factures.",
    cta: "Accéder à mon espace",
    quote: "Vos machines, vos devis et vos commandes, réunis au même endroit.",
    image: clientImage,
    imageAlt: "Moissonneuse-batteuse en pleine récolte de blé",
    redirect: "/client",
  },
} as const;

export function LoginScreen({ space }: Props) {
  const copy = COPY[space];
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_CREDENTIALS[space].email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS[space].password);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [state, setState] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    try {
      const user = await login(space, email, password);
      setState("success");
      toast.success(`Connexion réussie — bienvenue ${user.name.split(" ")[0]}`);
      setTimeout(() => navigate({ to: copy.redirect }), 700);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Visuel */}
      <div className="relative hidden overflow-hidden bg-[image:var(--gradient-hero)] lg:block">
        <img
          src={copy.image}
          alt={copy.imageAlt}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-75" />
        <AmbientBackground />
        <div className="relative flex h-full flex-col justify-between p-10 text-primary-foreground">
          <BrandLockup subtitle={space === "admin" ? "Espace commercial" : "Espace client"} />
          <div className="max-w-md animate-rise-in">
            <p className="text-[11px] uppercase tracking-[0.25em] text-primary-foreground/55">
              CENTRE 3D International
            </p>
            <p className="mt-4 font-display text-3xl font-semibold leading-tight">{copy.quote}</p>
            <div className="mt-8 flex gap-8 border-t border-primary-foreground/15 pt-6 text-sm text-primary-foreground/70">
              <div>
                <p className="font-display text-2xl font-bold text-primary-foreground">34</p>
                <p>machines au catalogue</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-primary-foreground">9</p>
                <p>villes couvertes</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-primary-foreground">5</p>
                <p>pays</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-primary-foreground/45">© 2026 CENTRE 3D International Ltd.</p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="relative flex items-center justify-center bg-background px-5 py-12">
        <AmbientBackground variant="surface" />
        <div className="w-full max-w-md animate-rise-in">
          <div className="lg:hidden">
            <BrandLockup subtitle={space === "admin" ? "Espace commercial" : "Espace client"} />
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-7 shadow-elevated lg:mt-0">
            {space === "client" && (
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-[11px] font-medium text-primary">
                Compte de démonstration
              </span>
            )}
            <h1 className="font-display text-2xl font-bold tracking-tight">{copy.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>

            <form onSubmit={onSubmit} className="mt-7 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-9"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <button type="button" className="text-xs text-primary hover:underline">
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 px-9"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                Se souvenir de moi
              </label>

              {state === "error" && (
                <p className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}
              {state === "success" && (
                <p className="flex items-center gap-2 rounded-lg border border-success/25 bg-success/8 px-3 py-2.5 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Connexion validée — ouverture de votre espace…
                </p>
              )}

              <Button
                type="submit"
                disabled={state === "loading" || state === "success"}
                className="h-11 w-full gradient-primary text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:brightness-105 active:scale-[0.99]"
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Vérification en cours…
                  </>
                ) : state === "success" ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Connecté
                  </>
                ) : (
                  copy.cta
                )}
              </Button>
            </form>

            <div className="mt-6 rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Compte de démonstration</p>
              <p className="mt-1 font-mono">{DEMO_CREDENTIALS[space].email}</p>
              <p className="font-mono">{DEMO_CREDENTIALS[space].password}</p>
            </div>
          </div>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Changer d'espace
          </Link>
        </div>
      </div>
    </div>
  );
}
