"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  IconBolt,
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconExternalLink,
  IconLoader2,
  IconMail,
  IconRefresh,
  IconSearch,
  IconShoppingCart,
  IconTruckDelivery,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { AdminRetryKinguinButton } from "@/components/admin/admin-retry-kinguin-button";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import {
  bulkRetryKinguinFulfillmentAction,
  bulkUpdateOrdersStatusAction,
} from "@/lib/admin/orders/bulk-actions";
import { canRetryKinguinPurchase } from "@/lib/admin/orders/kinguin-retry";
import { retryKinguinFulfillmentAction } from "@/lib/admin/orders/retry-fulfillment";
import type { AdminOrderListItem } from "@/lib/admin/orders/types";
import { formatDate, formatMoney, formatOrderStatus } from "@/lib/admin/format";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

function KeysCell({ order }: { order: AdminOrderListItem }) {
  if (order.expectedKeyCount === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const complete = order.pendingKeyCount === 0;

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span
        className={cn(
          "text-sm font-medium tabular-nums",
          complete ? "text-emerald-600 dark:text-emerald-400" : "",
        )}
      >
        {order.deliveredKeyCount}/{order.expectedKeyCount}
      </span>
      {!complete ? (
        <span className="text-[10px] text-amber-600 dark:text-amber-400">
          {order.pendingKeyCount} pend.
        </span>
      ) : order.deliveredKeyCount > order.expectedKeyCount ? (
        <span className="text-[10px] text-muted-foreground">
          +{order.deliveredKeyCount - order.expectedKeyCount} extra
        </span>
      ) : null}
    </div>
  );
}

function OrderRowActions({ order }: { order: AdminOrderListItem }) {
  const router = useRouter();
  const [isKinguinPending, startKinguinTransition] = useTransition();
  const canKinguin = canRetryKinguinPurchase(order);
  const detailHref = `/admin/orders/${order.id}`;

  async function copyOrderId() {
    try {
      await navigator.clipboard.writeText(order.id);
      toast.success("ID copiado al portapapeles.");
    } catch {
      toast.error("No se pudo copiar el ID.");
    }
  }

  function handleKinguinRetry() {
    startKinguinTransition(async () => {
      const result = await retryKinguinFulfillmentAction(order.id);
      if (result.status === "completed" || result.keysDelivered > 0) {
        toast.success(result.message);
        router.refresh();
        return;
      }
      if (result.status === "processing") {
        toast.message(result.message);
        router.refresh();
        return;
      }
      toast.error(result.message);
    });
  }

  return (
    <div
      className="flex items-center justify-end gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={detailHref} aria-label="Ver pedido">
              <IconExternalLink className="size-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ver pedido</TooltipContent>
      </Tooltip>

      {canKinguin ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <AdminRetryKinguinButton
              orderId={order.id}
              variant="ghost"
              size="icon-sm"
              iconOnly
              label="Comprar en Kinguin"
            />
          </TooltipTrigger>
          <TooltipContent>Comprar en Kinguin</TooltipContent>
        </Tooltip>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Acciones del pedido ${order.id.slice(0, 8)}`}
          >
            <IconDotsVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild>
            <Link href={detailHref}>
              <IconExternalLink className="size-4" />
              Ver detalle
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${detailHref}#deliver`}>
              <IconTruckDelivery className="size-4" />
              Entregar keys
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${detailHref}#email`}>
              <IconMail className="size-4" />
              Contactar cliente
            </Link>
          </DropdownMenuItem>
          {canKinguin ? (
            <DropdownMenuItem
              disabled={isKinguinPending}
              onClick={handleKinguinRetry}
            >
              <IconRefresh
                className={cn("size-4", isKinguinPending && "animate-spin")}
              />
              Comprar en Kinguin
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyOrderId}>
            <IconCopy className="size-4" />
            Copiar ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function AdminOrdersBoard({ orders }: AdminOrdersBoardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | OrderStatus | "manual"
  >("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [userFilterId, setUserFilterId] = useState<string | null>(null);

  useEffect(() => {
    const userId = searchParams.get("user");
    if (userId) {
      setTimeout(() => {
        setUserFilterId(userId);
      }, 0);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (userFilterId && order.customerUserId !== userFilterId) {
        return false;
      }
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
  }, [orders, query, statusFilter, userFilterId]);

  const allFilteredSelected =
    filtered.length > 0 &&
    filtered.every((order) => selectedIds.includes(order.id));
  const someFilteredSelected =
    filtered.some((order) => selectedIds.includes(order.id)) &&
    !allFilteredSelected;
  const headerCheckedState = allFilteredSelected
    ? true
    : someFilteredSelected
      ? "indeterminate"
      : false;

  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedIds.includes(order.id)),
    [orders, selectedIds],
  );
  const selectedKinguinEligible = selectedOrders.filter((order) =>
    canRetryKinguinPurchase(order),
  );

  function toggleAllFiltered(checked: boolean) {
    if (checked) {
      setSelectedIds(filtered.map((order) => order.id));
      return;
    }
    setSelectedIds([]);
  }

  function toggleRow(orderId: string, checked: boolean) {
    setSelectedIds((current) =>
      checked
        ? [...new Set([...current, orderId])]
        : current.filter((id) => id !== orderId),
    );
  }

  function handleBulkStatus(status: OrderStatus) {
    startTransition(async () => {
      const toastId = toast.loading(
        `Actualizando a ${formatOrderStatus(status)}…`,
      );
      const result = await bulkUpdateOrdersStatusAction(selectedIds, status);
      if (result.success) {
        toast.success(result.message ?? "Pedidos actualizados.", {
          id: toastId,
        });
        setSelectedIds([]);
        router.refresh();
      } else {
        toast.error(result.error ?? "No se pudo actualizar.", { id: toastId });
      }
    });
  }

  function handleBulkKinguin() {
    const ids = selectedKinguinEligible.map((order) => order.id);
    if (ids.length === 0) {
      toast.error("Ningún pedido seleccionado puede comprarse en Kinguin.");
      return;
    }

    startTransition(async () => {
      const toastId = toast.loading("Comprando en Kinguin…");
      const result = await bulkRetryKinguinFulfillmentAction(ids);
      if (result.success) {
        toast.success(result.message ?? "Kinguin procesado.", { id: toastId });
        if (result.details?.length) {
          toast.message(`${result.failed ?? 0} con avisos`, {
            description: result.details.slice(0, 3).join(" · "),
          });
        }
        setSelectedIds([]);
        router.refresh();
      } else {
        toast.error(result.error ?? "Falló la compra en Kinguin.", {
          id: toastId,
        });
      }
    });
  }

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
        <div className="flex flex-1 flex-col gap-2 sm:max-w-md">
          {userFilterId ? (
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                Filtrando por cliente
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => {
                  setUserFilterId(null);
                  router.push("/admin/orders");
                }}
              >
                Quitar filtro
              </Button>
            </div>
          ) : null}
          <InputGroup>
            <InputGroupAddon>
              <IconSearch className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por cliente, email o ID…"
            />
          </InputGroup>
        </div>
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
        <CardHeader className="pb-3">
          <CardTitle>Listado</CardTitle>
          <CardDescription>
            {filtered.length} de {orders.length} pedidos (últimos 100)
            {selectedIds.length > 0
              ? ` · ${selectedIds.length} seleccionado${selectedIds.length === 1 ? "" : "s"}`
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto px-0 pb-0 sm:px-6 sm:pb-6">
          {filtered.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              Ningún pedido coincide con los filtros actuales.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 pl-6">
                    <Checkbox
                      checked={headerCheckedState}
                      onCheckedChange={(checked) =>
                        toggleAllFiltered(checked === true)
                      }
                      aria-label="Seleccionar todos los pedidos visibles"
                    />
                  </TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Keys</TableHead>
                  <TableHead className="text-right">Ítems</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                  <TableHead className="w-[120px] pr-6 text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  const detailHref = `/admin/orders/${order.id}`;

                  return (
                    <TableRow
                      key={order.id}
                      className={cn(
                        "group cursor-pointer",
                        isSelected && "bg-muted/40",
                      )}
                      onClick={() => router.push(detailHref)}
                    >
                      <TableCell
                        className="pl-6"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            toggleRow(order.id, checked === true)
                          }
                          aria-label={`Seleccionar pedido ${order.id.slice(0, 8)}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="min-w-[120px]">
                          <Link
                            href={detailHref}
                            onClick={(event) => event.stopPropagation()}
                            className="font-mono text-xs font-semibold text-primary hover:underline"
                          >
                            #{order.id.slice(0, 8)}
                          </Link>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {order.isPreorder ? (
                              <Badge variant="outline" className="text-[10px]">
                                Preorder
                              </Badge>
                            ) : null}
                            {order.needsManualFulfillment ? (
                              <Badge
                                variant="outline"
                                className="border-amber-500/40 text-[10px] text-amber-700 dark:text-amber-400"
                              >
                                Manual
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-[160px]">
                          <p className="truncate text-sm font-medium">
                            {order.customerName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {order.customerEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <KeysCell order={order} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {order.itemCount}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatMoney(order.total, order.currency)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="pr-6">
                        <OrderRowActions order={order} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedIds.length > 0 ? (
        <div className="fixed bottom-6 left-1/2 z-50 flex w-[min(100vw-2rem,56rem)] -translate-x-1/2 flex-col gap-3 rounded-2xl border border-border/80 bg-background/90 px-4 py-3.5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:border-r sm:border-border sm:pr-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground tabular-nums">
                {selectedIds.length}
              </span>
              <span className="text-muted-foreground">
                seleccionado{selectedIds.length === 1 ? "" : "s"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="sm:hidden"
              onClick={() => setSelectedIds([])}
              aria-label="Limpiar selección"
            >
              <IconX className="size-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              disabled={isPending || selectedKinguinEligible.length === 0}
              onClick={handleBulkKinguin}
              className="h-8 gap-1.5 rounded-full"
            >
              {isPending ? (
                <IconLoader2 className="size-3.5 animate-spin" />
              ) : (
                <IconBolt className="size-3.5" />
              )}
              Kinguin ({selectedKinguinEligible.length})
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleBulkStatus("COMPLETED")}
              className="h-8 gap-1.5 rounded-full"
            >
              <IconCheck className="size-3.5 text-emerald-500" />
              Completar
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleBulkStatus("PROCESSING")}
              className="h-8 gap-1.5 rounded-full"
            >
              <IconRefresh className="size-3.5" />
              Procesando
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleBulkStatus("CANCELED")}
              className="h-8 gap-1.5 rounded-full"
            >
              Cancelar
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleBulkStatus("REFUNDED")}
              className="h-8 gap-1.5 rounded-full"
            >
              Reembolsar
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => setSelectedIds([])}
              className="hidden h-8 rounded-full sm:inline-flex"
            >
              Limpiar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
