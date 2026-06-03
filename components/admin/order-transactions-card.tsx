import Link from "next/link";
import type { AdminTransactionListItem } from "@/lib/admin/transactions/types";
import { TransactionStatusBadge } from "@/components/admin/transaction-status-badge";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { formatTransactionType } from "@/lib/transactions/labels";
import type { TransactionType } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OrderTransactionsCardProps = {
  transactions: AdminTransactionListItem[];
};

function amountDisplay(
  type: TransactionType,
  amount: string,
  currency: string,
): string {
  const value = formatMoney(amount, currency);
  if (type === "REFUND" || type === "PAYOUT") {
    return `−${value}`;
  }
  if (type === "CHARGE") {
    return `+${value}`;
  }
  return value;
}

export function OrderTransactionsCard({
  transactions,
}: OrderTransactionsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base">Transacciones</CardTitle>
          <CardDescription>
            Movimientos de pago vinculados a este pedido
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/transactions">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin transacciones registradas.{" "}
            <Link
              href="/admin/transactions"
              className="text-primary hover:underline"
            >
              Sincroniza desde pedidos
            </Link>{" "}
            en el módulo de transacciones.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {formatTransactionType(tx.type)}
                    </Badge>
                    <TransactionStatusBadge status={tx.status} />
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {tx.id}
                  </p>
                  {tx.description ? (
                    <p className="text-sm text-muted-foreground">
                      {tx.description}
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {amountDisplay(tx.type, tx.amount, tx.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
