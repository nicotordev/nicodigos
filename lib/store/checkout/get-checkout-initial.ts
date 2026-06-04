import "server-only";

import prisma from "@/lib/prisma";
import { getUserSettings } from "@/lib/settings/queries";
import type { UserAddress } from "@/lib/settings/types";
import { addressFieldsFromSaved } from "@/lib/store/checkout/addresses";
import type { CheckoutBillingInitial } from "@/lib/store/checkout/billing";
import { CHECKOUT_NEW_ADDRESS_ID } from "@/lib/store/checkout/constants";

export type CheckoutPageData = {
  initialValues: CheckoutBillingInitial;
  savedAddresses: UserAddress[];
};

async function getLastOrderBillingFallback(userId: string) {
  return prisma.order.findFirst({
    where: {
      userId,
      status: { not: "CANCELED" },
    },
    orderBy: { createdAt: "desc" },
    select: {
      billingDocumentType: true,
      billingFullName: true,
      billingEmail: true,
      billingPhone: true,
      billingRut: true,
      billingGiro: true,
      billingCompanyName: true,
    },
  });
}

function mergeBillingFromLastOrder(
  initial: CheckoutBillingInitial,
  last: NonNullable<Awaited<ReturnType<typeof getLastOrderBillingFallback>>>,
): CheckoutBillingInitial {
  const docType = last.billingDocumentType === "factura" ? "factura" : "boleta";

  return {
    ...initial,
    documentType: initial.documentType || docType,
    fullName: initial.fullName || last.billingFullName.trim(),
    email: initial.email || last.billingEmail.trim(),
    phone: initial.phone || last.billingPhone.trim(),
    rut: initial.rut || last.billingRut.trim(),
    giro: initial.giro || last.billingGiro.trim(),
    companyName: initial.companyName || last.billingCompanyName.trim(),
  };
}

export async function getCheckoutPageData(
  userId: string,
): Promise<CheckoutPageData> {
  const settings = await getUserSettings(userId);
  const savedAddresses = settings.addresses.filter(
    (address) => address.type === "billing",
  );

  const isCompany = settings.identification.holderType === "company";
  const defaultAddress =
    savedAddresses.find((address) => address.isDefault) ??
    savedAddresses[0] ??
    null;

  const useNewAddress = !defaultAddress;
  const addressSelection = useNewAddress
    ? CHECKOUT_NEW_ADDRESS_ID
    : defaultAddress.id;

  const addressFields = defaultAddress
    ? addressFieldsFromSaved(defaultAddress)
    : {
        addressLabel: "",
        region: "",
        commune: "",
        city: "",
        street: "",
        unit: "",
      };

  let fullName = settings.profile.fullName.trim();
  if (fullName === "Invitado") {
    fullName = "";
  }

  let email = settings.profile.email.trim();
  if (email.startsWith("guest_") && email.endsWith("@nicodigos.cl")) {
    email = "";
  }

  let initialValues: CheckoutBillingInitial = {
    documentType: isCompany ? "factura" : "boleta",
    fullName,
    email,
    phone: settings.profile.phone.trim(),
    rut: settings.identification.identificationNumber.trim(),
    giro: "",
    companyName: isCompany ? settings.identification.companyName.trim() : "",
    addressSelection,
    ...addressFields,
    acceptTerms: false,
  };

  const needsFallback =
    !initialValues.phone || !initialValues.rut || !initialValues.fullName;

  if (needsFallback) {
    const lastOrder = await getLastOrderBillingFallback(userId);
    if (lastOrder) {
      initialValues = mergeBillingFromLastOrder(initialValues, lastOrder);
    }
  }

  return {
    initialValues,
    savedAddresses,
  };
}

/** @deprecated Use getCheckoutPageData */
export async function getCheckoutBillingInitial(
  userId: string,
): Promise<CheckoutBillingInitial> {
  const data = await getCheckoutPageData(userId);
  return data.initialValues;
}
