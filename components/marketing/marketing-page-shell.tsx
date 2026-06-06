import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarketingPageShellProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  narrow?: boolean;
  variant?: "default" | "rose" | "warm";
};

const orbVariants = {
  default: {
    primary: "bg-primary/10",
    secondary: "bg-indigo-500/10",
  },
  rose: {
    primary: "bg-rose-500/10",
    secondary: "bg-pink-500/5",
  },
  warm: {
    primary: "bg-rose-500/10",
    secondary: "bg-amber-500/10",
  },
} as const;

export function MarketingPageShell({
  children,
  className,
  contentClassName,
  narrow = false,
  variant = "default",
}: MarketingPageShellProps) {
  const orbs = orbVariants[variant];

  return (
    <main
      className={cn("flex-1 relative overflow-hidden bg-background", className)}
    >
      <div className="absolute inset-0 admin-dashboard-grid opacity-20 pointer-events-none hidden md:block" />
      <div
        className={cn(
          "absolute top-[-10%] right-[-10%] -z-10 h-[500px] w-[500px] rounded-full blur-[130px] pointer-events-none hidden md:block",
          orbs.primary,
        )}
      />
      <div
        className={cn(
          "absolute bottom-[-10%] left-[-10%] -z-10 h-[400px] w-[400px] rounded-full blur-[110px] pointer-events-none hidden md:block",
          orbs.secondary,
        )}
      />

      <div
        className={cn(
          "mx-auto relative z-10 px-4 py-6 sm:px-6 md:py-10 lg:px-8",
          narrow ? "max-w-3xl" : "max-w-7xl",
          contentClassName,
        )}
      >
        {children}
      </div>
    </main>
  );
}

type MarketingPageHeaderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
};

export function MarketingPageHeader({
  title,
  description,
  icon,
  className,
}: MarketingPageHeaderProps) {
  return (
    <header className={cn("border-b border-border/10 pb-5 md:pb-6", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          {icon ? (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-inner md:size-11">
              {icon}
            </div>
          ) : null}
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground/90 max-w-2xl">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}

type MarketingHeroBannerProps = {
  badge?: ReactNode;
  title: string;
  description: string;
  stat?: ReactNode;
  className?: string;
  tone?: "default" | "warm";
};

export function MarketingHeroBanner({
  badge,
  title,
  description,
  stat,
  className,
  tone = "default",
}: MarketingHeroBannerProps) {
  const toneClasses =
    tone === "warm"
      ? "border-rose-500/20 from-card via-rose-500/5 to-card"
      : "border-border/50 from-card via-muted/20 to-card";

  return (
    <div
      className={cn(
        "relative hidden overflow-hidden rounded-3xl border bg-gradient-to-r p-6 shadow-lg md:block sm:p-10",
        toneClasses,
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          tone === "warm"
            ? "bg-gradient-to-r from-rose-500/5 via-transparent to-amber-500/5"
            : "bg-gradient-to-r from-primary/5 via-transparent to-indigo-500/5",
        )}
      />
      <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          {badge}
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground/90">
            {description}
          </p>
        </div>
        {stat}
      </div>
    </div>
  );
}

type MarketingCompactHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function MarketingCompactHeader({
  eyebrow,
  title,
  description,
  className,
}: MarketingCompactHeaderProps) {
  return (
    <header
      className={cn(
        "space-y-2 border-b border-border/80 pb-5 md:hidden",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {description}
        </p>
      ) : null}
    </header>
  );
}
