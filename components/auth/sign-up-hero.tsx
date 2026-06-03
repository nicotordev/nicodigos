const perks = [
  "Catálogo de keys al instante",
  "Historial de pedidos en tu cuenta",
  "Ofertas para miembros registrados",
] as const;

export function SignUpHero() {
  return (
    <aside
      aria-hidden
      className="relative hidden w-0 flex-1 overflow-hidden bg-primary lg:block"
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 75% 55% at 0% 0%, color-mix(in oklch, var(--primary-foreground) 20%, transparent) 0%, transparent 58%),
            radial-gradient(ellipse 65% 50% at 100% 100%, color-mix(in oklch, var(--primary-foreground) 16%, transparent) 0%, transparent 52%),
            linear-gradient(135deg, color-mix(in oklch, var(--primary) 88%, black) 0%, var(--primary) 45%, color-mix(in oklch, var(--primary) 70%, black) 100%)
          `,
        }}
      />

      <div
        className="auth-hero-grid absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in oklch, var(--primary-foreground) 38%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in oklch, var(--primary-foreground) 38%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      <div className="auth-hero-orb auth-hero-orb-a absolute -left-16 top-[12%] size-64 rounded-full border border-primary-foreground/18" />
      <div className="auth-hero-orb auth-hero-orb-b absolute -right-28 bottom-[18%] size-[22rem] rounded-full bg-primary-foreground/10 blur-3xl" />
      <div className="auth-hero-orb auth-hero-orb-c absolute right-[22%] top-20 size-3 rounded-full bg-primary-foreground/50" />
      <div className="auth-hero-orb auth-hero-orb-d absolute left-[42%] bottom-36 size-2 rounded-full bg-primary-foreground/35" />

      <p className="pointer-events-none absolute -left-2 bottom-10 select-none font-heading text-[clamp(5rem,12vw,9.5rem)] font-bold leading-none tracking-tighter text-primary-foreground/[0.08]">
        únete
      </p>

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <span className="auth-hero-pulse inline-flex size-2 rounded-full bg-primary-foreground" />
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary-foreground/80">
            Nueva cuenta
          </p>
        </div>

        <div className="max-w-[360px] space-y-8 my-auto">
          <blockquote className="space-y-5">
            <p className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-primary-foreground xl:text-5xl">
              Tu biblioteca
              <br />
              <span className="text-primary-foreground/55">empieza aquí.</span>
            </p>
            <p className="border-l-2 border-primary-foreground/30 pl-4 text-sm leading-relaxed text-primary-foreground/75">
              Regístrate gratis, compra keys digitales y gestiona activaciones
              desde un solo panel.
            </p>
          </blockquote>

          <ul className="space-y-3">
            {perks.map((perk, index) => (
              <li
                key={perk}
                className="auth-hero-step flex items-center gap-3 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.07] px-4 py-3 text-sm font-medium text-primary-foreground/85 backdrop-blur-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 font-mono text-[10px] font-bold text-primary-foreground"
                  aria-hidden
                >
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </ul>

          {/* Mock Account Perks Widget */}
          <div className="group relative w-full max-w-sm rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.04] p-5 backdrop-blur-md shadow-2xl transition-all duration-300 hover:bg-primary-foreground/[0.08] hover:border-primary-foreground/25 hover:-translate-y-1 hover:shadow-primary-foreground/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground text-[10px] font-bold">★</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/90">Club Nicodigos</span>
              </div>
              <span className="text-[9px] text-primary-foreground/70 bg-primary-foreground/15 px-2 py-0.5 rounded-full font-medium tracking-wide">Nivel 1</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-primary-foreground/75">
                  <span>Progreso de descuento</span>
                  <span className="font-semibold text-primary-foreground">75%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-primary-foreground/15 overflow-hidden">
                  <div className="h-full rounded-full bg-primary-foreground/85 transition-all duration-500" style={{ width: "75%" }} />
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-primary-foreground/70">
                Desbloquea <span className="font-semibold text-primary-foreground">+5% de descuento permanente</span> en todas tus keys al completar tu perfil.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-primary-foreground/70">
          <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-sm">
            Sin cuota mensual
          </span>
          <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-sm">
            Pago seguro
          </span>
        </div>
      </div>
    </aside>
  );
}
