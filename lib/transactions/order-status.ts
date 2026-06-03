import type {
  OrderStatus,
  TransactionStatus,
} from "@/lib/generated/prisma/client";

export function transactionStatusFromOrderStatus(
  orderStatus: OrderStatus,
): TransactionStatus {
  switch (orderStatus) {
    case "COMPLETED":
    case "REFUNDED":
      return "SUCCEEDED";
    case "PROCESSING":
    case "PENDING":
      return "PENDING";
    case "CANCELED":
      return "CANCELED";
    default:
      return "PENDING";
  }
}

export function orderChargeIdempotencyKey(orderId: string): string {
  return `order:${orderId}:charge`;
}

export function orderRefundIdempotencyKey(orderId: string): string {
  return `order:${orderId}:refund`;
}
