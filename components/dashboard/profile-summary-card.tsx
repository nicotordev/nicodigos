import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMemberSince, getUserInitials } from "@/lib/dashboard/format";

type ProfileSummaryCardProps = {
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  role?: string | null;
  memberSince: Date | string;
};

export function ProfileSummaryCard({
  name,
  email,
  image,
  emailVerified,
  role,
  memberSince,
}: ProfileSummaryCardProps) {
  const initials = getUserInitials(name);

  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold">Resumen de cuenta</CardTitle>
        <CardDescription className="text-xs">Información de tu perfil en nicodigos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-2xl border border-border/20">
          <Avatar size="lg" className="border border-border/50 bg-background shadow-sm">
            {image ? <AvatarImage src={image} alt={name} /> : null}
            <AvatarFallback className="text-base font-bold text-primary font-heading">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground mt-0.5">{email}</p>
          </div>
        </div>

        <Separator className="bg-border/60" />

        <dl className="grid gap-4 text-sm">
          <div className="flex items-center justify-between gap-4 py-1">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado del email</dt>
            <dd>
              <Badge 
                variant={emailVerified ? "default" : "outline"}
                className={emailVerified ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10" : "bg-destructive/10 text-destructive border-destructive/20"}
              >
                {emailVerified ? "Verificado" : "Pendiente"}
              </Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-1">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo de cuenta</dt>
            <dd>
              <Badge variant="secondary" className="bg-muted text-muted-foreground border border-border/20">
                {role === "ADMIN" ? "Administrador" : "Usuario"}
              </Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-1">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Miembro desde</dt>
            <dd className="font-semibold text-foreground font-mono">{formatMemberSince(memberSince)}</dd>
          </div>
        </dl>

        {!emailVerified ? (
          <Button variant="default" className="w-full rounded-xl mt-2 font-medium" asChild>
            <Link href="/auth/resend-verification">
              Verificar correo electrónico
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
