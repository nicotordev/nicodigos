export function SignInHero() {
  return (
    <aside
      aria-hidden
      className="relative hidden w-0 flex-1 overflow-hidden bg-primary lg:block"
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in oklch, var(--primary-foreground) 18%, transparent) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 0% 100%, color-mix(in oklch, var(--primary-foreground) 12%, transparent) 0%, transparent 50%),
            linear-gradient(145deg, var(--primary) 0%, color-mix(in oklch, var(--primary) 75%, black) 100%)
          `,
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in oklch, var(--primary-foreground) 40%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in oklch, var(--primary-foreground) 40%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="absolute -right-24 top-1/4 size-80 rounded-full border border-primary-foreground/15" />
      <div className="absolute -left-16 bottom-1/3 size-56 rounded-full bg-primary-foreground/10 blur-2xl" />
      <div className="absolute right-1/4 top-12 size-3 rounded-full bg-primary-foreground/50" />
      <div className="absolute left-1/3 bottom-40 size-2 rounded-full bg-primary-foreground/35" />

      <p className="pointer-events-none absolute -right-6 bottom-8 select-none font-heading text-[clamp(6rem,14vw,11rem)] font-bold leading-none tracking-tighter text-primary-foreground/[0.08]">
        nicodigos
      </p>

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-2 rounded-full bg-primary-foreground" />
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary-foreground/80">
            Keys digitales
          </p>
        </div>

        <blockquote className="max-w-md space-y-6">
          <p className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-primary-foreground xl:text-5xl">
            Compra la key,
            <br />
            <span className="text-primary-foreground/55">actívala</span>
            <br />
            en minutos.
          </p>
          <p className="border-l-2 border-primary-foreground/30 pl-4 text-sm leading-relaxed text-primary-foreground/75">
            Juegos, DLC y software con entrega digital inmediata. Sin esperas,
            sin envíos — solo tu código, listo para canjear.
          </p>
        </blockquote>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-primary-foreground/70">
          <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-sm">
            Entrega instantánea
          </span>
          <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-sm">
            Juegos &amp; DLC
          </span>
          <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-sm">
            Activación segura
          </span>
        </div>
      </div>
    </aside>
  );
}
