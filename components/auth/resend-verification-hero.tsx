export function ResendVerificationHero() {
  return (
    <aside
      aria-hidden
      className="relative hidden w-0 flex-1 overflow-hidden bg-primary lg:block"
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 0% 0%, color-mix(in oklch, var(--primary-foreground) 18%, transparent) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 100% 100%, color-mix(in oklch, var(--primary-foreground) 12%, transparent) 0%, transparent 50%),
            linear-gradient(135deg, var(--primary) 0%, color-mix(in oklch, var(--primary) 70%, black) 100%)
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
          backgroundSize: "48px 48px",
        }}
      />

      <div className="auth-hero-orb auth-hero-orb-a absolute -right-20 top-[15%] size-64 rounded-full border border-primary-foreground/15" />
      <div className="auth-hero-orb auth-hero-orb-b absolute -left-16 bottom-[25%] size-80 rounded-full bg-primary-foreground/10 blur-2xl" />

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <span className="auth-hero-pulse inline-flex size-2 rounded-full bg-primary-foreground" />
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary-foreground/80">
            Confirmación
          </p>
        </div>

        <div className="max-w-[360px] space-y-8 my-auto">
          <blockquote className="space-y-5">
            <p className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-primary-foreground xl:text-5xl">
              Revisa tu
              <br />
              <span className="text-primary-foreground/55">bandeja.</span>
            </p>
            <p className="border-l-2 border-primary-foreground/30 pl-4 text-sm leading-relaxed text-primary-foreground/75">
              El enlace de verificación puede tardar unos minutos. Revisa también
              correo no deseado o promociones si no lo encuentras.
            </p>
          </blockquote>

          {/* Mock Verification Mailbox Widget */}
          <div className="group relative w-full max-w-sm rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.04] p-5 backdrop-blur-md shadow-2xl transition-all duration-300 hover:bg-primary-foreground/[0.08] hover:border-primary-foreground/25 hover:-translate-y-1 hover:shadow-primary-foreground/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground text-[10px]">✉</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/90">Correo entrante</span>
              </div>
              <span className="flex items-center gap-1.5 text-[9px] text-primary-foreground/75">
                <span className="inline-block size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Esperando
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-lg bg-black/15 p-3 text-xs border border-primary-foreground/5">
                <p className="font-semibold text-primary-foreground">Activa tu cuenta de Nicodigos</p>
                <p className="text-primary-foreground/60 text-[10px] mt-0.5">Enviado hace unos instantes</p>
              </div>
              
              <div className="flex justify-between items-center text-[11px] text-primary-foreground/70 px-1">
                <span>Remitente: no-reply@nicodigos.com</span>
                <span className="font-mono text-[9px] bg-primary-foreground/10 px-1.5 py-0.5 rounded">Resend</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-primary-foreground/70">
          <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-sm">
            Entrega inmediata
          </span>
          <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-sm">
            Soporte 24/7
          </span>
        </div>
      </div>
    </aside>
  );
}
