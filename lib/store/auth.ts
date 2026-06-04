import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { storeRoutes } from "@/lib/store/navigation";

function makeGuestSession(user: {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isGuest: true as const,
      image: null as string | null,
    },
    session: {
      id: `guest_sess_${user.id}`,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      token: `guest_token_${user.id}`,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ipAddress: null,
      userAgent: null,
    },
  };
}

async function mergeGuestCartToUser(guestUserId: string, authUserId: string) {
  try {
    // 1. Merge cart
    const guestCart = await prisma.cart.findUnique({
      where: { userId: guestUserId },
      include: { items: true },
    });

    if (guestCart && guestCart.items.length > 0) {
      const authCart = await prisma.cart.upsert({
        where: { userId: authUserId },
        create: { userId: authUserId },
        update: {},
        select: { id: true },
      });

      for (const item of guestCart.items) {
        await prisma.cartItem.upsert({
          where: {
            cartId_offerId: {
              cartId: authCart.id,
              offerId: item.offerId,
            },
          },
          create: {
            cartId: authCart.id,
            productId: item.productId,
            offerId: item.offerId,
            quantity: item.quantity,
          },
          update: {
            quantity: { increment: item.quantity },
          },
        });
      }

      await prisma.cartItem.deleteMany({
        where: { cartId: guestCart.id },
      });
      await prisma.cart.delete({
        where: { id: guestCart.id },
      });
    }

    // 2. Merge wishlist
    const guestWishlist = await prisma.wishlist.findUnique({
      where: { userId: guestUserId },
      include: { items: true },
    });

    if (guestWishlist && guestWishlist.items.length > 0) {
      const authWishlist = await prisma.wishlist.upsert({
        where: { userId: authUserId },
        create: { userId: authUserId },
        update: {},
        select: { id: true },
      });

      for (const item of guestWishlist.items) {
        await prisma.wishlistItem.upsert({
          where: {
            wishlistId_productId: {
              wishlistId: authWishlist.id,
              productId: item.productId,
            },
          },
          create: {
            wishlistId: authWishlist.id,
            productId: item.productId,
          },
          update: {},
        });
      }

      await prisma.wishlistItem.deleteMany({
        where: { wishlistId: guestWishlist.id },
      });
      await prisma.wishlist.delete({
        where: { id: guestWishlist.id },
      });
    }

    // 3. Move orders, transactions, and addresses to the registered user
    await prisma.$transaction([
      prisma.order.updateMany({
        where: { userId: guestUserId },
        data: { userId: authUserId },
      }),
      prisma.transaction.updateMany({
        where: { userId: guestUserId },
        data: { userId: authUserId },
      }),
      prisma.userAddress.updateMany({
        where: { userId: guestUserId },
        data: { userId: authUserId, isDefault: false },
      }),
    ]);

    // 4. Delete the guest user record
    await prisma.user.delete({
      where: { id: guestUserId },
    }).catch(() => {});
  } catch (error) {
    console.error("[auth] Error merging guest cart:", error);
  }
}

export type StoreSession =
  | NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
  | ReturnType<typeof makeGuestSession>;

const getRequestSessionStore = cache(() => {
  return {
    session: null as StoreSession | null,
  };
});

export async function getOptionalStoreSession(): Promise<StoreSession | null> {
  const store = getRequestSessionStore();
  if (store.session) {
    return store.session;
  }

  const authSession = await auth.api.getSession({
    headers: await headers(),
  });

  const cookieStore = await cookies();
  const guestUserId = cookieStore.get("guest_user_id")?.value;

  if (authSession?.user) {
    if (guestUserId) {
      await mergeGuestCartToUser(guestUserId, authSession.user.id);
      try {
        cookieStore.delete("guest_user_id");
      } catch {
        // Ignorar si estamos en render read-only
      }
    }
    store.session = authSession;
    return authSession;
  }

  if (guestUserId) {
    const guestUser = await prisma.user.findUnique({
      where: { id: guestUserId },
    });
    if (guestUser) {
      const session = makeGuestSession(guestUser);
      store.session = session;
      return session;
    }
  }

  return null;
}

export async function getOrCreateStoreSession(): Promise<StoreSession> {
  const existing = await getOptionalStoreSession();
  if (existing) {
    return existing;
  }

  const cookieStore = await cookies();

  const newGuestId = `guest_${crypto.randomUUID()}`;
  const newEmail = `guest_${newGuestId}@nicodigos.cl`;

  const guestUser = await prisma.user.create({
    data: {
      id: newGuestId,
      name: "Invitado",
      email: newEmail,
      emailVerified: false,
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  cookieStore.set("guest_user_id", newGuestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  });

  const session = makeGuestSession(guestUser);
  const store = getRequestSessionStore();
  store.session = session;

  return session;
}

export async function requireStoreUser(
  callbackPath: string = storeRoutes.cart,
): Promise<StoreSession> {
  const session = await getOptionalStoreSession();

  if (!session?.user) {
    redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  return session;
}
