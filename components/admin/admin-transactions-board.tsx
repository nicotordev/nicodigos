"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { IconRefresh, IconSearch } from "@tabler/icons-react";
import { syncTransactionsFromOrdersAction } from "@/lib/admin/transactions/actions";
import type {
  AdminTransactionListItem,
  AdminTransactionSummary,
} from "@/lib/admin/transactions/types";
import { TransactionStatusBadge } from "@/components/admin/transaction-status-badge";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { formatTransactionType } from "@/lib/transactions/labels";
import type {
  TransactionStatus,
  TransactionType,
} from "@/lib/generated/prisma/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminTransactionsBoardProps = {
  transactions: AdminTransactionListItem[];
  summary: AdminTransactionSummary;
};

const TYPE_FILTERS: Array<{ value: "all" | TransactionType; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "CHARGE", label: "Cobros" },
  { value: "REFUND", label: "Reembolsos" },
  { value: "PAYOUT", label: "Proveedor" },
  { value: "ADJUSTMENT", label: "Ajustes" },
];

function signedAmountLabel(
  type: TransactionType,
  amount: string,
  currency: string,
): string {
  const formatted = formatMoney(amount, currency);
  if (type === "REFUND" || type === "PAYOUT") {
    return `−${formatted}`;
  }
  if (type === "CHARGE") {
    return `+${formatted}`;
  }
  return formatted;
}

export function AdminTransactionsBoard({
  transactions,
  summary,
}: AdminTransactionsBoardProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TransactionStatus>(
    "all",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) {
        return false;
      }
      if (statusFilter !== "all" && tx.status !== statusFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.customerEmail.toLowerCase().includes(q) ||
        tx.customerName.toLowerCase().includes(q) ||
        (tx.orderId?.toLowerCase().includes(q) ?? false) ||
        (tx.providerReference?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [transactions, query, typeFilter, statusFilter]);

  function handleSync() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await syncTransactionsFromOrdersAction();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Transacciones</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {summary.totalCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cobros exitosos</CardDescription>
            <CardTitle className="text-xl tabular-nums">
              {formatMoney(summary.succeededVolume)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {summary.pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fallidas</CardDescription>
            <CardTitle className="text-2xl tabular-nums text-destructive">
              {summary.failedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="max-w-md">
          <InputGroupAddon>
            <IconSearch className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por ID, cliente o pedido…"
          />
        </InputGroup>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleSync}
        >
          {isPending ? (
            <Spinner className="size-4" />
          ) : (
            <IconRefresh className="size-4" />
          )}
          Sincronizar desde pedidos
        </Button>
      </div>

      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            type="button"
            size="sm"
            variant={typeFilter === filter.value ? "default" : "outline"}
            onClick={() => setTypeFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Libro de transacciones</CardTitle>
          <CardDescription>
            {filtered.length} de {transactions.length} registros (últimos{" "}
            {transactions.length})
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {transactions.length === 0
                ? "Sin transacciones. Usa «Sincronizar desde pedidos» o regístralas al completar un checkout."
                : "Ningún resultado para los filtros actuales."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatTransactionType(tx.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TransactionStatusBadge status={tx.status} />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/users/${tx.userId}`}
                        className="block min-w-0 hover:text-primary"
                      >
                        <p className="truncate text-sm font-medium">
                          {tx.customerName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {tx.customerEmail}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {tx.orderId ? (
                        <Link
                          href={`/admin/orders/${tx.orderId}`}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          {tx.orderId.slice(0, 8)}…
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {tx.provider}
                      {tx.providerReference ? (
                        <span className="block font-mono">
                          {tx.providerReference.slice(0, 12)}…
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums whitespace-nowrap">
                      {signedAmountLabel(tx.type, tx.amount, tx.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
