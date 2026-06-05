"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconSearch, IconShoppingCart } from "@tabler/icons-react";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import type { AdminOrderListItem } from "@/lib/admin/orders/types";
import { formatDate, formatMoney } from "@/lib/admin/format";
import type { OrderStatus } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_FILTERS: Array<{
  value: "all" | OrderStatus | "manual";
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "manual", label: "Entrega manual" },
  { value: "PENDING", label: "Pendiente" },
  { value: "PROCESSING", label: "Procesando" },
  { value: "COMPLETED", label: "Completado" },
  { value: "CANCELED", label: "Cancelado" },
  { value: "REFUNDED", label: "Reembolsado" },
];

type AdminOrdersBoardProps = {
  orders: AdminOrderListItem[];
};

export function AdminOrdersBoard({ orders }: AdminOrdersBoardProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | OrderStatus | "manual"
  >("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter === "manual") {
        if (!order.needsManualFulfillment) {
          return false;
        }
      } else if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerEmail.toLowerCase().includes(q) ||
        (order.kinguinOrderId?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [orders, query, statusFilter]);

  if (orders.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconShoppingCart className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Sin pedidos</EmptyTitle>
          <EmptyDescription>
            Los pedidos de la tienda aparecerán aquí cuando los clientes
            compren.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="max-w-md">
          <InputGroupAddon>
            <IconSearch className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, email o ID…"
          />
        </InputGroup>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              size="sm"
              variant={statusFilter === filter.value ? "default" : "outline"}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>
            {filtered.length} de {orders.length} pedidos (últimos 100)
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ítems</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-xs font-medium text-primary hover:underline"
                    >
                      {order.id.slice(0, 8)}…
                    </Link>
                    {order.isPreorder ? (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        Preorder
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {order.customerName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {order.customerEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      {order.needsManualFulfillment ? (
                        <Badge
                          variant="outline"
                          className="border-amber-500/40 text-[10px] text-amber-700 dark:text-amber-400"
                        >
                          Manual
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {order.itemCount}
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
        </CardContent>
      </Card>
    </div>
  );
}
