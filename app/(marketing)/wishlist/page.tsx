import type { Metadata } from "next";
import { IconHeart } from "@tabler/icons-react";

import {
  MarketingPageHeader,
  MarketingPageShell,
} from "@/components/marketing/marketing-page-shell";
import { WishlistViewPanel } from "@/components/store/wishlist-view";
import { getOptionalStoreSession } from "@/lib/store/auth";
import { getWishlistView } from "@/lib/store/wishlist/queries";

export const metadata: Metadata = {
  title: "Lista de deseos",
  description:
    "Guarda tus keys, gift cards y licencias favoritas para comprarlas después en Nicodigos Chile.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/wishlist",
  },
};

export default async function WishlistPage() {
  const session = await getOptionalStoreSession();
  const wishlist = session
    ? ((await getWishlistView(session.user.id)) ?? {
        id: "",
        items: [],
        itemCount: 0,
      })
    : {
        id: "",
        items: [],
        itemCount: 0,
      };

  return (
    <MarketingPageShell
      variant="rose"
      contentClassName="space-y-6 md:space-y-8"
    >
      <MarketingPageHeader
        title="Lista de deseos"
        description="Guarda tus productos favoritos para comprarlos o darles seguimiento más tarde."
        icon={<IconHeart className="size-5 text-rose-500" aria-hidden />}
      />

      <WishlistViewPanel wishlist={wishlist} />
    </MarketingPageShell>
  );
}
