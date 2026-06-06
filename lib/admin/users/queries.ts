import prisma from "@/lib/prisma";
import type {
  AdminUserDetail,
  AdminUserListItem,
} from "@/lib/admin/users/types";

const USER_LIST_LIMIT = 200;

async function getSpentByUserIds(
  userIds: string[],
): Promise<Map<string, string>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const rows = await prisma.order.groupBy({
    by: ["userId"],
    where: {
      userId: { in: userIds },
      status: { in: ["COMPLETED", "PROCESSING"] },
    },
    _sum: { total: true },
  });

  return new Map(
    rows.map((row) => [row.userId, row._sum.total?.toString() ?? "0"]),
  );
}

export async function getAdminUsers(): Promise<AdminUserListItem[]> {
  const users = await prisma.user.findMany({
    take: USER_LIST_LIMIT,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });

  const spentMap = await getSpentByUserIds(users.map((user) => user.id));

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    orderCount: user._count.orders,
    totalSpent: spentMap.get(user.id) ?? "0",
  }));
}

export async function getAdminUserById(
  id: string,
): Promise<AdminUserDetail | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          total: true,
          currency: true,
          createdAt: true,
        },
      },
      _count: { select: { orders: true } },
    },
  });

  if (!user) {
    return null;
  }

  const spentMap = await getSpentByUserIds([id]);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    orderCount: user._count.orders,
    totalSpent: spentMap.get(id) ?? "0",
    recentOrders: user.orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: order.total.toString(),
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
    })),
  };
}
