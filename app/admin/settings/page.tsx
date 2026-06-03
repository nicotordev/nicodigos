import type { Metadata } from "next";
import { SettingsPage } from "@/components/settings/settings-page";
import { requireAdmin } from "@/lib/admin/auth";
import { isR2Configured } from "@/lib/r2/env";
import { getUserSettings } from "@/lib/settings/queries";

export const metadata: Metadata = {
  title: "Ajustes",
};

export default async function AdminSettingsPage() {
  const session = await requireAdmin();
  const initialData = await getUserSettings(session.user.id);

  return (
    <SettingsPage initialData={initialData} r2Configured={isR2Configured()} />
  );
}
