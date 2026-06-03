import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import type { AdminUserDetail } from "@/lib/admin/users/types";
import { formatDate, formatMoney } from "@/lib/admin/format";
import type { OrderStatus } from "@/lib/generated/prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserInitials } from "@/lib/dashboard/format";

type AdminUserDetailViewProps = {
  user: AdminUserDetail;
};

export function AdminUserDetailView({ user }: AdminUserDetailViewProps) {
  const initials = getUserInitials(user.name);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/users">
          <IconArrowLeft className="size-4" />
          Volver a clientes
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-4">
        <Avatar size="lg">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.name} />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
              {user.role === "ADMIN" ? "Administrador" : "Cliente"}
            </Badge>
            {!user.emailVerified ? (
              <Badge variant="outline">Email sin verificar</Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pedidos</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {user.orderCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total gastado</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatMoney(user.totalSpent)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Registro</CardDescription>
            <CardTitle className="text-base font-normal">
              {formatDate(user.createdAt)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos recientes</CardTitle>
          <CardDescription>Últimos 8 pedidos del cliente</CardDescription>
        </CardHeader>
        <CardContent>
          {user.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin pedidos aún.</p>
          ) : (
            <ul className="divide-y divide-border">
              {user.recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-sm text-primary hover:underline"
                  >
                    {order.id.slice(0, 12)}…
                  </Link>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status as OrderStatus} />
                    <span className="tabular-nums font-medium">
                      {formatMoney(order.total, order.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
