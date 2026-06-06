import "server-only";

import prisma from "@/lib/prisma";

export async function getAdminNotificationEmails(): Promise<string[]> {
  const fromEnv = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const dbAdmins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });

  const fromDb = dbAdmins
    .map((user) => user.email.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set([...fromEnv, ...fromDb])];
}
