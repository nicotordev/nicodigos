export function ResetPasswordHero() {
  return (
    <aside
      aria-hidden
      className="relative hidden w-0 flex-1 overflow-hidden bg-primary lg:block"
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 100% 20%, color-mix(in oklch, var(--primary-foreground) 18%, transparent) 0%, transparent 55%),
            linear-gradient(155deg, var(--primary) 0%, color-mix(in oklch, var(--primary) 72%, black) 100%)
          `,
        }}
      />

      <div
        className="auth-hero-grid absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in oklch, var(--primary-foreground) 35%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in oklch, var(--primary-foreground) 35%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      <div className="auth-hero-orb auth-hero-orb-a absolute -right-16 top-1/3 size-80 rounded-full border border-primary-foreground/15" />
      <div className="auth-hero-orb auth-hero-orb-b absolute -left-20 bottom-1/4 size-72 rounded-full bg-primary-foreground/10 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <span className="auth-hero-pulse inline-flex size-2 rounded-full bg-primary-foreground" />
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary-foreground/80">
            Nueva contraseña
          </p>
        </div>

        <div className="max-w-[360px] space-y-8 my-auto">
          <blockquote className="space-y-5">
            <p className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-primary-foreground xl:text-5xl">
              Elige una clave
              <br />
              <span className="text-primary-foreground/55">segura y única.</span>
            </p>
            <p className="border-l-2 border-primary-foreground/30 pl-4 text-sm leading-relaxed text-primary-foreground/75">
              Usa al menos 8 caracteres. Evita reutilizar contraseñas de otros
              sitios.
            </p>
          </blockquote>

          {/* Mock Password Strength Widget */}
          <div className="group relative w-full max-w-sm rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.04] p-5 backdrop-blur-md shadow-2xl transition-all duration-300 hover:bg-primary-foreground/[0.08] hover:border-primary-foreground/25 hover:-translate-y-1 hover:shadow-primary-foreground/5">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/90">Fuerza de contraseña</span>
              <span className="text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded font-medium tracking-wide">Excelente</span>
            </div>

            <div className="space-y-3">
              <div className="h-1.5 w-full rounded-full bg-primary-foreground/15 overflow-hidden flex gap-0.5">
                <div className="h-full rounded-l-full bg-emerald-400 flex-1" />
                <div className="h-full bg-emerald-400 flex-1" />
                <div className="h-full bg-emerald-400 flex-1" />
                <div className="h-full rounded-r-full bg-emerald-400 flex-1" />
              </div>

              <ul className="space-y-1.5 text-[11px] text-primary-foreground/80">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-300 font-bold">✓</span> Mínimo 8 caracteres
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-300 font-bold">✓</span> Incluye número o símbolo
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-300 font-bold">✓</span> Mayúsculas y minúsculas
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-xs text-primary-foreground/60">
          El enlace de recuperación caduca en una hora.
        </p>
      </div>
    </aside>
  );
}
