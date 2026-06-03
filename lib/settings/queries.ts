import prisma from "@/lib/prisma";
import { buildSettingsInitialState } from "@/lib/settings/build-initial-state";
import {
  mapAddressFromDb,
  mapIdentificationFromDb,
  mapNotificationsFromDb,
  mapPreferencesFromDb,
  mapPrivacyFromDb,
  mapProfileFromUser,
} from "@/lib/settings/mappers";
import type { SettingsInitialData } from "@/lib/settings/types";

export async function ensureUserSettingsRecords(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.userProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    }),
    prisma.userIdentification.upsert({
      where: { userId },
      create: { userId },
      update: {},
    }),
    prisma.userPreferences.upsert({
      where: { userId },
      create: { userId },
      update: {},
    }),
  ]);
}

export async function getUserSettings(
  userId: string,
): Promise<SettingsInitialData> {
  await ensureUserSettingsRecords(userId);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      profile: true,
      identification: true,
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      preferences: true,
    },
  });

  const base = buildSettingsInitialState({
    name: user.name,
    email: user.email,
    image: user.image,
    emailVerified: user.emailVerified,
    role: user.role,
    memberSince: user.createdAt.toISOString(),
  });

  return {
    ...base,
    profile: mapProfileFromUser(user, user.profile),
    identification: mapIdentificationFromDb(user.identification),
    addresses: user.addresses.map(mapAddressFromDb),
    notifications: mapNotificationsFromDb(user.preferences),
    privacy: mapPrivacyFromDb(user.preferences),
    preferences: mapPreferencesFromDb(user.preferences),
  };
}
