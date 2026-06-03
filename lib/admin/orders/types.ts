import type { AdminTransactionListItem } from "@/lib/admin/transactions/types";
import type { OrderStatus } from "@/lib/generated/prisma/client";

export type AdminOrderListItem = {
  id: string;
  status: OrderStatus;
  total: string;
  currency: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  kinguinOrderId: string | null;
  isPreorder: boolean;
};

export type AdminOrderKeyDetail = {
  id: string;
  kinguinKeyId: string;
  status: string;
  contentType: string;
  serialMasked: string;
};

export type AdminOrderItemDetail = {
  id: string;
  name: string;
  quantity: number;
  lineTotal: string;
  kinguinProductId: string;
  productId: string | null;
  keys: AdminOrderKeyDetail[];
};

export type AdminOrderDetail = {
  id: string;
  status: OrderStatus;
  total: string;
  subtotal: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  kinguinOrderId: string | null;
  kinguinStatus: string | null;
  isPreorder: boolean;
  preorderReleaseAt: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  items: AdminOrderItemDetail[];
  transactions: AdminTransactionListItem[];
};
