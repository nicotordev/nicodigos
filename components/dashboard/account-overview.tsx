import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatMemberSince } from "@/lib/dashboard/format";

type AccountOverviewProps = {
  name: string;
  emailVerified: boolean;
  memberSince: Date | string;
};

export function AccountOverview({
  name,
  emailVerified,
  memberSince,
}: AccountOverviewProps) {
  const firstName = name.trim().split(/\s+/)[0] ?? "usuario";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Bienvenido de nuevo
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Hola, {firstName} 👋
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant={emailVerified ? "default" : "outline"}
            className={emailVerified ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10" : ""}
          >
            {emailVerified ? "Cuenta verificada" : "Email pendiente"}
          </Badge>
          <Badge variant="secondary" className="bg-muted/80 text-muted-foreground">
            Miembro desde {formatMemberSince(memberSince)}
          </Badge>
        </div>
      </div>
      <Separator className="bg-border/60" />
    </div>
  );
}

