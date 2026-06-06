"use client";

import Link from "next/link";
import { useEffect } from "react";
import { IconArrowLeft, IconMail, IconShoppingCart } from "@tabler/icons-react";

import { AdminUserEditForm } from "@/components/admin/admin-user-edit-form";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserInitials } from "@/lib/dashboard/format";

type AdminUserDetailViewProps = {
  user: AdminUserDetail;
};

export function AdminUserDetailView({ user }: AdminUserDetailViewProps) {
  const initials = getUserInitials(user.name);

  useEffect(() => {
    if (window.location.hash === "#edit") {
      document.getElementById("edit")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/users">
          <IconArrowLeft className="size-4" />
          Clientes
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : null}
                <AvatarFallback className="text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                  >
                    {user.role === "ADMIN" ? "Administrador" : "Cliente"}
                  </Badge>
                  {!user.emailVerified ? (
                    <Badge variant="outline">Email sin verificar</Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    >
                      Email verificado
                    </Badge>
                  )}
                </div>
                <h1 className="font-heading text-2xl font-bold tracking-tight">
                  {user.name}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {user.id}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${user.email}`}>
                  <IconMail className="size-4" />
                  Email
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/orders?user=${user.id}`}>
                  <IconShoppingCart className="size-4" />
                  Pedidos
                </Link>
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pedidos
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {user.orderCount}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total gastado
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {formatMoney(user.totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Registro
              </p>
              <p className="mt-1 text-sm">{formatDate(user.createdAt)}</p>
              <p className="text-xs text-muted-foreground">
                Actualizado {formatDate(user.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pedidos recientes</CardTitle>
            <CardDescription>Últimos 8 pedidos del cliente</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
            {user.recentOrders.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                Sin pedidos aún.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Pedido</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          #{order.id.slice(0, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge
                          status={order.status as OrderStatus}
                        />
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatMoney(order.total, order.currency)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <aside className="xl:sticky xl:top-20 xl:self-start">
          <Card id="edit">
            <CardHeader>
              <CardTitle className="text-base">Editar cliente</CardTitle>
              <CardDescription>
                Nombre, correo, rol y verificación de email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminUserEditForm user={user} embedded />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
