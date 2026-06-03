const steps = [
  { label: "01", text: "Indica tu correo" },
  { label: "02", text: "Abre el enlace" },
  { label: "03", text: "Elige contraseña nueva" },
] as const;

export function ForgotPasswordHero() {
  return (
    <aside
      aria-hidden
      className="relative hidden w-0 flex-1 overflow-hidden bg-primary lg:block"
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% -10%, color-mix(in oklch, var(--primary-foreground) 22%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 60% 45% at 100% 80%, color-mix(in oklch, var(--primary-foreground) 14%, transparent) 0%, transparent 55%),
            linear-gradient(160deg, var(--primary) 0%, color-mix(in oklch, var(--primary) 68%, black) 100%)
          `,
        }}
      />

      <div
        className="auth-hero-grid absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in oklch, var(--primary-foreground) 35%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in oklch, var(--primary-foreground) 35%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="auth-hero-orb auth-hero-orb-a absolute -right-20 top-[18%] size-72 rounded-full border border-primary-foreground/20" />
      <div className="auth-hero-orb auth-hero-orb-b absolute -left-24 bottom-[22%] size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
      <div className="auth-hero-orb auth-hero-orb-c absolute right-[30%] top-16 size-4 rounded-full bg-primary-foreground/55" />
      <div className="auth-hero-orb auth-hero-orb-d absolute left-[38%] bottom-48 size-2.5 rounded-full bg-primary-foreground/40" />

      <p className="pointer-events-none absolute -right-4 bottom-6 select-none font-heading text-[clamp(5.5rem,13vw,10rem)] font-bold leading-none tracking-tighter text-primary-foreground/[0.07]">
        recupera
      </p>

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <span className="auth-hero-pulse inline-flex size-2 rounded-full bg-primary-foreground" />
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary-foreground/80">
            Acceso seguro
          </p>
        </div>

        <div className="max-w-[360px] space-y-8 my-auto">
          <blockquote className="space-y-5">
            <p className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-primary-foreground xl:text-5xl">
              Recupera tu cuenta
              <br />
              <span className="text-primary-foreground/50">en tres pasos.</span>
            </p>
            <p className="border-l-2 border-primary-foreground/30 pl-4 text-sm leading-relaxed text-primary-foreground/75">
              Te enviamos un enlace único por correo. Caduca en una hora y solo
              funciona una vez.
            </p>
          </blockquote>

          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li
                key={step.label}
                className="auth-hero-step flex items-center gap-4 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.07] px-4 py-3 backdrop-blur-sm"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <span className="font-mono text-xs font-semibold tabular-nums text-primary-foreground/90">
                  {step.label}
                </span>
                <span className="text-sm font-medium text-primary-foreground/85">
                  {step.text}
                </span>
              </li>
            ))}
          </ol>

          {/* Mock Secure Link Status Widget */}
          <div className="group relative w-full max-w-sm rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.04] p-5 backdrop-blur-md shadow-2xl transition-all duration-300 hover:bg-primary-foreground/[0.08] hover:border-primary-foreground/25 hover:-translate-y-1 hover:shadow-primary-foreground/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">🛡</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/90">Seguridad del Token</span>
              </div>
              <span className="text-[9px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium tracking-wide">Válido</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-primary-foreground/60">Tiempo restante</span>
                <span className="font-semibold text-primary-foreground font-mono">59:59</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-primary-foreground/60">Límite de usos</span>
                <span className="font-semibold text-primary-foreground">1 intento único</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-primary-foreground/70">
          <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-sm">
            Enlace de un solo uso
          </span>
          <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-sm">
            Entrega por Resend
          </span>
        </div>
      </div>
    </aside>
  );
}
