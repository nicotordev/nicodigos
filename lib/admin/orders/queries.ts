import { getTransactionsForOrder } from "@/lib/admin/transactions/queries";
import prisma from "@/lib/prisma";
import type {
  AdminOrderDetail,
  AdminOrderListItem,
} from "@/lib/admin/orders/types";

const ORDER_LIST_LIMIT = 100;

function maskSerial(serial: string): string {
  if (serial.length <= 8) {
    return "••••••••";
  }
  return `${serial.slice(0, 4)}••••${serial.slice(-4)}`;
}

export async function getAdminOrders(): Promise<AdminOrderListItem[]> {
  const orders = await prisma.order.findMany({
    take: ORDER_LIST_LIMIT,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    total: order.total.toString(),
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    customerName: order.user.name,
    customerEmail: order.user.email,
    itemCount: order._count.items,
    kinguinOrderId: order.kinguinOrderId,
    isPreorder: order.isPreorder,
  }));
}

export async function getAdminOrderById(
  id: string,
): Promise<AdminOrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          keys: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  const transactions = await getTransactionsForOrder(id);

  return {
    id: order.id,
    status: order.status,
    total: order.total.toString(),
    subtotal: order.subtotal.toString(),
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    kinguinOrderId: order.kinguinOrderId,
    kinguinStatus: order.kinguinStatus,
    isPreorder: order.isPreorder,
    preorderReleaseAt: order.preorderReleaseAt?.toISOString() ?? null,
    customer: {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
      role: order.user.role,
    },
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      lineTotal: item.lineTotal.toString(),
      kinguinProductId: item.kinguinProductId,
      productId: item.productId,
      keys: item.keys.map((key) => ({
        id: key.id,
        kinguinKeyId: key.kinguinKeyId,
        status: key.status,
        contentType: key.contentType,
        serialMasked: maskSerial(key.serial),
      })),
    })),
    transactions,
  };
}
