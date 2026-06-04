import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import type { CheckoutBillingInput } from "@/lib/store/checkout/billing";

export type CheckoutOrderBillingMeta = {
  addressId: string;
  addressLabel: string;
};

export type CheckoutOrderDraft = {
  orderId: string;
  email: string;
  subject: string;
  amount: number;
  itemCount: number;
};

export async function createOrderFromCart(
  userId: string,
  billing: CheckoutBillingInput,
  billingMeta: CheckoutOrderBillingMeta,
): Promise<CheckoutOrderDraft | { error: string }> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              kinguinId: true,
              kinguinProductId: true,
              isActive: true,
              qty: true,
              isPreorder: true,
            },
          },
          offer: {
            select: {
              id: true,
              name: true,
              kinguinOfferId: true,
              costPrice: true,
              sellPrice: true,
              qty: true,
              isPreorder: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return { error: "Tu carrito está vacío." };
  }

  let subtotal = 0;
  let itemCount = 0;
  let isPreorder = false;

  const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

  for (const item of cart.items) {
    const { product, offer } = item;

    if (!product.isActive || product.qty <= 0) {
      return { error: `"${product.name}" ya no está disponible.` };
    }

    if (offer.qty < item.quantity) {
      return {
        error: `Solo quedan ${offer.qty} unidades de "${product.name}".`,
      };
    }

    const unitSellPrice = new Prisma.Decimal(offer.sellPrice.toString());
    const unitCostPrice = new Prisma.Decimal(offer.costPrice.toString());
    const lineTotal = unitSellPrice.mul(item.quantity);

    subtotal += Number(lineTotal.toString());
    itemCount += item.quantity;
    isPreorder = isPreorder || product.isPreorder || offer.isPreorder;

    orderItems.push({
      product: { connect: { id: product.id } },
      offer: { connect: { id: offer.id } },
      kinguinId: product.kinguinId,
      kinguinProductId: product.kinguinProductId,
      kinguinOfferId: offer.kinguinOfferId,
      name: product.name,
      quantity: item.quantity,
      unitCostPrice,
      unitSellPrice,
      lineTotal,
    });
  }

  const subtotalRounded = Math.round(subtotal);
  const iva = Math.round(subtotalRounded * 0.19);
  const flowCommission = Math.round((subtotalRounded + iva) * 0.037961);
  const total = subtotalRounded + iva + flowCommission;

  const subtotalDecimal = new Prisma.Decimal(subtotalRounded.toString());
  const totalDecimal = new Prisma.Decimal(total.toString());

  if (total <= 0) {
    return { error: "El total del pedido no es válido." };
  }

  const order = await prisma.order.create({
    data: {
      userId,
      status: "PENDING",
      currency: "CLP",
      subtotal: subtotalDecimal,
      total: totalDecimal,
      isPreorder,
      billingDocumentType: billing.documentType,
      billingAddressId: billingMeta.addressId,
      billingAddressLabel: billingMeta.addressLabel,
      billingFullName:
        billing.documentType === "factura"
          ? billing.companyName
          : billing.fullName,
      billingEmail: billing.email,
      billingPhone: billing.phone,
      billingRut: billing.rut,
      billingGiro: billing.giro,
      billingCompanyName: billing.companyName,
      billingRegion: billing.region,
      billingCommune: billing.commune,
      billingCity: billing.city,
      billingStreet: billing.street,
      billingUnit: billing.unit ?? "",
      termsAcceptedAt: new Date(),
      items: {
        create: orderItems,
      },
    },
    select: { id: true },
  });

  const subject =
    itemCount === 1
      ? `Compra en nicodigos.cl — ${orderItems[0]?.name ?? "producto digital"}`
      : `Compra en nicodigos.cl (${itemCount} productos)`;

  return {
    orderId: order.id,
    email: billing.email,
    subject,
    amount: total,
    itemCount,
  };
}
