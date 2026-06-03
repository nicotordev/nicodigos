import prisma from "@/lib/prisma";
import type {
  OrderKeyStatus,
  OrderStatus,
} from "@/lib/generated/prisma/client";

export type UserDashboardOrder = {
  id: string;
  status: OrderStatus;
  total: string;
  currency: string;
  createdAt: string;
  itemCount: number;
};

export type UserDashboardData = {
  memberSince: string;
  totalOrders: number;
  completedOrders: number;
  totalSpent: string;
  cartItemCount: number;
  pendingKeys: number;
  recentOrders: UserDashboardOrder[];
};

export async function getUserDashboardData(
  userId: string,
): Promise<UserDashboardData> {
  const [
    user,
    totalOrders,
    completedOrders,
    spentAgg,
    cart,
    pendingKeys,
    recentOrdersRaw,
  ] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { createdAt: true },
    }),
    prisma.order.count({ where: { userId } }),
    prisma.order.count({
      where: { userId, status: "COMPLETED" },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        userId,
        status: { in: ["COMPLETED", "PROCESSING"] },
      },
    }),
    prisma.cart.findUnique({
      where: { userId },
      select: { _count: { select: { items: true } } },
    }),
    prisma.orderKey.count({
      where: {
        status: "PENDING",
        orderItem: { order: { userId } },
      },
    }),
    prisma.order.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const recentOrders = mapOrders(recentOrdersRaw);

  return {
    memberSince: user.createdAt.toISOString(),
    totalOrders,
    completedOrders,
    totalSpent: spentAgg._sum.total?.toString() ?? "0",
    cartItemCount: cart?._count.items ?? 0,
    pendingKeys,
    recentOrders,
  };
}

function mapOrders(
  orders: {
    id: string;
    status: OrderStatus;
    total: { toString(): string };
    currency: string;
    createdAt: Date;
    _count: { items: number };
  }[],
): UserDashboardOrder[] {
  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    total: order.total.toString(),
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    itemCount: order._count.items,
  }));
}

export async function getUserOrders(
  userId: string,
): Promise<UserDashboardOrder[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return mapOrders(orders);
}

export type UserKeyItem = {
  id: string;
  productName: string;
  orderId: string;
  status: OrderKeyStatus;
  createdAt: string;
  serial?: string | null;
};

export async function getUserKeys(userId: string): Promise<UserKeyItem[]> {
  const keys = await prisma.orderKey.findMany({
    where: { orderItem: { order: { userId } } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      serial: true,
      createdAt: true,
      orderItem: {
        select: { name: true, orderId: true },
      },
    },
  });

  return keys.map((key) => ({
    id: key.id,
    productName: key.orderItem.name,
    orderId: key.orderItem.orderId,
    status: key.status,
    createdAt: key.createdAt.toISOString(),
    serial: key.status === "DELIVERED" ? key.serial : null,
  }));
}
