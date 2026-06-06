import type { Metadata } from "next";

import type { SeoMetadataDocument } from "@/lib/seo/metadata";
import { mergeSeoMetadata } from "@/lib/seo/metadata";
import { storeRoutes } from "@/lib/store/navigation";

export function buildDefaultHomeSeoMetadata(): SeoMetadataDocument {
  const description =
    "Tienda de juegos digitales en Chile: keys Steam, gift cards PSN y Xbox, licencias de software y suscripciones con entrega al tiro y soporte local.";

  const metadata: Metadata = {
    title: "Nicodigos — Juegos digitales, keys y gift cards Chile",
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "Nicodigos — Marketplace digital en Chile",
      description,
      type: "website",
      url: storeRoutes.home,
    },
    twitter: {
      card: "summary_large_image",
      title: "Nicodigos",
      description,
    },
  };

  return metadata;
}

export function resolveHomeSeoMetadata(
  override: SeoMetadataDocument | null | undefined,
): SeoMetadataDocument {
  return mergeSeoMetadata(buildDefaultHomeSeoMetadata(), override);
}
