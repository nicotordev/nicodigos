"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/auth";
import {
  sendOrderCustomerEmailSchema,
  updateOrderSchema,
  type SendOrderCustomerEmailInput,
  type UpdateOrderInput,
} from "@/lib/admin/orders/schemas";
import { sendOrderCustomerEmail } from "@/lib/email/order-customer-email";
import prisma from "@/lib/prisma";
import { syncTransactionsForOrder } from "@/lib/transactions/on-order";

export type OrderActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

function revalidateOrderPaths(orderId: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/dashboard/orders");
}

export async function updateOrderAction(
  input: UpdateOrderInput,
): Promise<OrderActionResult> {
  await requireAdmin();

  const parsed = updateOrderSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: first };
  }

  const data = parsed.data;
  const existing = await prisma.order.findUnique({
    where: { id: data.orderId },
    select: {
      id: true,
      userId: true,
      total: true,
      currency: true,
      kinguinOrderId: true,
      status: true,
    },
  });

  if (!existing) {
    return { success: false, error: "Pedido no encontrado." };
  }

  let preorderReleaseAt: Date | null = null;
  if (data.preorderReleaseAt) {
    const parsedDate = new Date(data.preorderReleaseAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return { success: false, error: "Fecha de lanzamiento inválida." };
    }
    preorderReleaseAt = parsedDate;
  }

  const updated = await prisma.order.update({
    where: { id: data.orderId },
    data: {
      status: data.status,
      billingDocumentType: data.billingDocumentType,
      billingFullName: data.billingFullName,
      billingEmail: data.billingEmail,
      billingPhone: data.billingPhone,
      billingRut: data.billingRut,
      billingGiro: data.billingGiro,
      billingCompanyName: data.billingCompanyName,
      billingRegion: data.billingRegion,
      billingCommune: data.billingCommune,
      billingCity: data.billingCity,
      billingStreet: data.billingStreet,
      billingUnit: data.billingUnit,
      kinguinOrderId: data.kinguinOrderId,
      kinguinStatus: data.kinguinStatus,
      isPreorder: data.isPreorder,
      preorderReleaseAt: data.isPreorder ? preorderReleaseAt : null,
    },
    select: {
      id: true,
      userId: true,
      status: true,
      total: true,
      currency: true,
      kinguinOrderId: true,
      updatedAt: true,
    },
  });

  if (existing.status !== updated.status) {
    await syncTransactionsForOrder(updated);
  }

  revalidateOrderPaths(data.orderId);
  return { success: true, message: "Pedido actualizado." };
}

export async function sendOrderCustomerEmailAction(
  input: SendOrderCustomerEmailInput,
): Promise<OrderActionResult> {
  await requireAdmin();

  const parsed = sendOrderCustomerEmailSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: first };
  }

  const data = parsed.data;
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    select: { id: true },
  });

  if (!order) {
    return { success: false, error: "Pedido no encontrado." };
  }

  const result = await sendOrderCustomerEmail({
    to: data.to,
    subject: data.subject,
    htmlBody: data.htmlBody,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, message: "Correo enviado al cliente." };
}
