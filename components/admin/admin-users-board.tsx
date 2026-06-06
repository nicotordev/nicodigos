"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  IconCopy,
  IconDotsVertical,
  IconExternalLink,
  IconLoader2,
  IconMail,
  IconSearch,
  IconShield,
  IconShoppingCart,
  IconUser,
  IconUserCheck,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { bulkUpdateUsersAction } from "@/lib/admin/users/actions";
import type { AdminUserListItem } from "@/lib/admin/users/types";
import { formatDate, formatMoney } from "@/lib/admin/format";
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
import { getUserInitials } from "@/lib/dashboard/format";
import { cn } from "@/lib/utils";

type UserFilter = "all" | "admin" | "unverified" | "buyers";

const FILTERS: Array<{ value: UserFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "buyers", label: "Con pedidos" },
  { value: "unverified", label: "Sin verificar" },
  { value: "admin", label: "Admins" },
];

type AdminUsersBoardProps = {
  users: AdminUserListItem[];
};

function RoleBadge({ role }: { role: string }) {
  return (
    <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
      {role === "ADMIN" ? "Admin" : "Cliente"}
    </Badge>
  );
}

function UserRowActions({ user }: { user: AdminUserListItem }) {
  const detailHref = `/admin/users/${user.id}`;

  async function copyUserId() {
    try {
      await navigator.clipboard.writeText(user.id);
      toast.success("ID copiado.");
    } catch {
      toast.error("No se pudo copiar el ID.");
    }
  }

  return (
    <div
      className="flex items-center justify-end gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={detailHref} aria-label="Ver cliente">
              <IconExternalLink className="size-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ver cliente</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`${detailHref}#edit`} aria-label="Editar cliente">
              <IconUser className="size-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Editar</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Acciones de ${user.name}`}
          >
            <IconDotsVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={detailHref}>
              <IconExternalLink className="size-4" />
              Ver perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${detailHref}#edit`}>
              <IconUser className="size-4" />
              Editar cliente
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/orders?user=${user.id}`}>
              <IconShoppingCart className="size-4" />
              Ver pedidos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`mailto:${user.email}`}>
              <IconMail className="size-4" />
              Enviar email
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyUserId}>
            <IconCopy className="size-4" />
            Copiar ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function AdminUsersBoard({ users }: AdminUsersBoardProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === "ADMIN").length,
      unverified: users.filter((user) => !user.emailVerified).length,
      buyers: users.filter((user) => user.orderCount > 0).length,
    }),
    [users],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      if (filter === "admin" && user.role !== "ADMIN") return false;
      if (filter === "unverified" && user.emailVerified) return false;
      if (filter === "buyers" && user.orderCount === 0) return false;
      if (!q) return true;
      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q)
      );
    });
  }, [users, query, filter]);

  const allFilteredSelected =
    filtered.length > 0 &&
    filtered.every((user) => selectedIds.includes(user.id));
  const someFilteredSelected =
    filtered.some((user) => selectedIds.includes(user.id)) &&
    !allFilteredSelected;
  const headerCheckedState = allFilteredSelected
    ? true
    : someFilteredSelected
      ? "indeterminate"
      : false;

  function toggleAllFiltered(checked: boolean) {
    setSelectedIds(checked ? filtered.map((user) => user.id) : []);
  }

  function toggleRow(userId: string, checked: boolean) {
    setSelectedIds((current) =>
      checked
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId),
    );
  }

  function handleBulkUpdate(input: {
    role?: "USER" | "ADMIN";
    emailVerified?: boolean;
  }) {
    startTransition(async () => {
      const toastId = toast.loading("Actualizando clientes…");
      const result = await bulkUpdateUsersAction({
        userIds: selectedIds,
        ...input,
      });
      if (result.success) {
        toast.success(result.message ?? "Clientes actualizados.", {
          id: toastId,
        });
        setSelectedIds([]);
        router.refresh();
      } else {
        toast.error(result.error ?? "No se pudo actualizar.", { id: toastId });
      }
    });
  }

  if (users.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconUsers className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Sin usuarios</EmptyTitle>
          <EmptyDescription>
            Aún no hay cuentas registradas en la tienda.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {stats.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Con pedidos</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {stats.buyers}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sin verificar</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {stats.unverified}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Administradores</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {stats.admins}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <InputGroup className="max-w-md">
          <InputGroupAddon>
            <IconSearch className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, email o ID…"
          />
        </InputGroup>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={filter === item.value ? "default" : "outline"}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Clientes</CardTitle>
          <CardDescription>
            {filtered.length} de {users.length} cuentas
            {selectedIds.length > 0
              ? ` · ${selectedIds.length} seleccionado${selectedIds.length === 1 ? "" : "s"}`
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto px-0 pb-0 sm:px-6 sm:pb-6">
          {filtered.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              Ningún cliente coincide con los filtros.
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
                      aria-label="Seleccionar todos los clientes visibles"
                    />
                  </TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Pedidos</TableHead>
                  <TableHead className="text-right">Gastado</TableHead>
                  <TableHead className="text-right">Registro</TableHead>
                  <TableHead className="w-[100px] pr-6 text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => {
                  const isSelected = selectedIds.includes(user.id);
                  const detailHref = `/admin/users/${user.id}`;
                  const initials = getUserInitials(user.name);

                  return (
                    <TableRow
                      key={user.id}
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
                            toggleRow(user.id, checked === true)
                          }
                          aria-label={`Seleccionar ${user.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-[200px] items-center gap-3">
                          <Avatar size="sm">
                            {user.image ? (
                              <AvatarImage src={user.image} alt={user.name} />
                            ) : null}
                            <AvatarFallback className="text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <Link
                              href={detailHref}
                              onClick={(event) => event.stopPropagation()}
                              className="truncate font-medium hover:text-primary hover:underline"
                            >
                              {user.name}
                            </Link>
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </p>
                            {!user.emailVerified ? (
                              <Badge
                                variant="outline"
                                className="mt-1 text-[10px]"
                              >
                                Sin verificar
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {user.orderCount}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatMoney(user.totalSpent)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="pr-6">
                        <UserRowActions user={user} />
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
        <div className="fixed bottom-6 left-1/2 z-50 flex w-[min(100vw-2rem,48rem)] -translate-x-1/2 flex-col gap-3 rounded-2xl border border-border/80 bg-background/90 px-4 py-3.5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:border-r sm:border-border sm:pr-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground tabular-nums">
                {selectedIds.length}
              </span>
              <span className="text-muted-foreground">seleccionados</span>
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
              disabled={isPending}
              onClick={() => handleBulkUpdate({ role: "ADMIN" })}
              className="h-8 gap-1.5 rounded-full"
            >
              {isPending ? (
                <IconLoader2 className="size-3.5 animate-spin" />
              ) : (
                <IconShield className="size-3.5" />
              )}
              Hacer admin
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleBulkUpdate({ role: "USER" })}
              className="h-8 gap-1.5 rounded-full"
            >
              <IconUser className="size-3.5" />
              Hacer cliente
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleBulkUpdate({ emailVerified: true })}
              className="h-8 gap-1.5 rounded-full"
            >
              <IconUserCheck className="size-3.5 text-emerald-500" />
              Verificar email
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
