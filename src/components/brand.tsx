import { cn } from "@/lib/utils";
import mark from "@/assets/centre3d-mark.png.asset.json";
import lockup from "@/assets/centre3d-lockup.png.asset.json";

/** Cube isométrique Centre 3D — logo fourni, jamais redessiné. */
export function BrandMark({ className }: { className?: string | undefined }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-9 w-9 shrink-0 items-center justify-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-xl bg-primary/15 blur-md dark:bg-primary-glow/25"
      />
      <img
        src={mark.url}
        alt="Centre 3D"
        width={72}
        height={72}
        className="relative h-full w-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
      />
    </span>
  );
}

export function BrandLockup({
  className,
  subtitle = "Machines & équipements agricoles",
  compact = false,
}: {
  className?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  if (compact) return <BrandMark className={className} />;

  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      <span className="hidden min-w-0 sm:flex flex-col leading-none">
        <img
          src={lockup.url}
          alt="Centre 3D"
          width={220}
          height={59}
          className="h-7 w-auto max-w-[168px] object-contain object-left dark:brightness-125"
        />
        <span className="mt-1.5 truncate pl-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {subtitle}
        </span>
      </span>
      <span className="sm:hidden"><BrandMark /></span>
    </span>
  );
}

