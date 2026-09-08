import { useMemo } from "react";

/**
 * Environnement ambiant Centre 3D : couches de profondeur, courbes
 * topographiques, grille d'agriculture de précision, lumière atmosphérique.
 */
export function AmbientBackground({ variant = "hero" }: { variant?: "hero" | "surface" }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: (i * 53) % 100,
        size: 2 + ((i * 7) % 4),
        delay: (i * 1.61) % 18,
        duration: 22 + ((i * 5) % 14),
        opacity: 0.1 + ((i % 5) * 0.06),
      })),
    [],
  );

  const contours = (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full text-primary/25"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M-40 ${210 + i * 74} C 260 ${140 + i * 70}, 520 ${300 + i * 66}, 760 ${230 + i * 72} S 1240 ${130 + i * 68}, 1480 ${250 + i * 70}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={i % 3 === 0 ? 1.2 : 0.6}
          opacity={0.16 + i * 0.03}
        />
      ))}
    </svg>
  );

  if (variant === "surface") {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-surface)]" />
        <div className="absolute inset-0 grid-pattern opacity-60" />
        <div className="absolute inset-0 opacity-40">{contours}</div>
        <div className="absolute -left-48 top-[-6rem] h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-[130px] animate-float-slow" />
        <div className="absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-primary-glow/10 blur-[120px] animate-float-slow [animation-delay:-6s]" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-earth/8 blur-[130px] animate-float-slow [animation-delay:-11s]" />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* profondeur : halos superposés */}
      <div className="absolute left-1/2 top-[-20rem] h-[46rem] w-[46rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[150px] animate-float-slow" />
      <div className="absolute -left-48 bottom-[-16rem] h-[36rem] w-[36rem] rounded-full bg-primary-glow/20 blur-[140px] animate-float-slow [animation-delay:-7s]" />
      <div className="absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-earth/16 blur-[130px] animate-float-slow [animation-delay:-3s]" />

      {/* grille de précision en perspective */}
      <div
        className="absolute inset-x-[-25%] bottom-0 h-[55%] grid-pattern opacity-50"
        style={{ transform: "perspective(700px) rotateX(64deg)", transformOrigin: "bottom" }}
      />

      {/* courbes topographiques */}
      <div className="absolute inset-0 opacity-70">{contours}</div>

      {/* géométrie isométrique inspirée du logo */}
      <svg
        aria-hidden
        className="absolute right-[6%] top-[14%] hidden h-64 w-64 text-primary-glow/25 animate-float-slow lg:block"
        viewBox="0 0 100 100"
      >
        {[
          [50, 12],
          [28, 52],
          [72, 52],
        ].map(([cx, cy], i) => (
          <g key={i} stroke="currentColor" strokeWidth="0.9" fill="none">
            <path d={`M${cx} ${cy! - 12} l18 10 v20 l-18 10 -18 -10 v-20 z`} />
            <path d={`M${cx! - 18} ${cy! - 2} l18 10 18 -10`} />
            <path d={`M${cx} ${cy! + 8} v20`} />
          </g>
        ))}
      </svg>

      {/* horizon de champs */}
      <svg
        className="absolute inset-x-0 bottom-0 h-44 w-full text-primary/25"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
      >
        <path d="M0 120 C 240 60, 420 160, 720 100 S 1200 40, 1440 110 L1440 160 L0 160 Z" fill="currentColor" opacity="0.32" />
        <path d="M0 140 C 300 90, 500 170, 780 130 S 1180 90, 1440 140 L1440 160 L0 160 Z" fill="currentColor" opacity="0.22" />
      </svg>

      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full bg-primary-glow animate-drift"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
