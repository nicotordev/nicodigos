import type {
  OrderKeyStatus,
  OrderStatus,
} from "@/lib/generated/prisma/client";

const orderStatusLabelsEs: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  PROCESSING: "En proceso",
  COMPLETED: "Completado",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export function formatOrderStatusEs(status: OrderStatus): string {
  return orderStatusLabelsEs[status];
}

const orderKeyStatusLabelsEs: Record<OrderKeyStatus, string> = {
  PENDING: "Pendiente",
  PROCESSING: "En proceso",
  DELIVERED: "Entregada",
  RETURNED: "Devuelta",
  REFUNDED: "Reembolsada",
  CANCELED: "Cancelada",
};

export function formatOrderKeyStatusEs(status: OrderKeyStatus): string {
  return orderKeyStatusLabelsEs[status];
}

export function formatMemberSince(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
