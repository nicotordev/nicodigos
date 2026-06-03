"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileSummaryCard } from "@/components/dashboard/profile-summary-card";
import { AddressSettingsCard } from "@/components/settings/address-settings-card";
import { AppPreferencesCard } from "@/components/settings/app-preferences-card";
import { DangerZoneCard } from "@/components/settings/danger-zone-card";
import { IdentificationSettingsCard } from "@/components/settings/identification-settings-card";
import { NotificationPreferencesCard } from "@/components/settings/notification-preferences-card";
import { PrivacySecuritySettingsCard } from "@/components/settings/privacy-security-settings-card";
import { ProfileSettingsCard } from "@/components/settings/profile-settings-card";
import {
  SettingsNav,
  type SettingsNavItem,
} from "@/components/settings/settings-nav";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { useSettingsSections } from "@/components/settings/use-settings-sections";
import type {
  SettingsInitialData,
  SettingsSectionId,
} from "@/lib/settings/types";

const NAV_ITEMS: SettingsNavItem[] = [
  { id: "cuenta", label: "Resumen" },
  { id: "perfil", label: "Perfil" },
  { id: "identificacion", label: "Identificación" },
  { id: "direcciones", label: "Direcciones" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "privacidad", label: "Privacidad" },
  { id: "preferencias", label: "Preferencias" },
  { id: "peligro", label: "Zona de peligro" },
];

type SettingsPageProps = {
  initialData: SettingsInitialData;
  r2Configured: boolean;
};

export function SettingsPage({ initialData, r2Configured }: SettingsPageProps) {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>("cuenta");
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const {
    data,
    setData,
    savedSnapshot,
    savingSection,
    sectionMessages,
    sectionErrors,
    isSectionDirty,
    cancelSection,
    saveSection,
  } = useSettingsSections(initialData);

  useEffect(() => {
    if (searchParams.get("emailChanged") === "1") {
      setTimeout(() => {
        setBannerMessage(
          "Tu correo se actualizó correctamente. Si no ves el cambio, recarga la página.",
        );
      }, 0);
    }
  }, [searchParams]);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => item.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveSection(visible.target.id as SettingsSectionId);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );

    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 md:space-y-8">
      <SettingsPageHeader
        title="Configuración"
        description="Cada sección se guarda por separado. Los cambios de correo requieren verificación por email."
      />

      {bannerMessage ? (
        <p
          role="status"
          className="rounded-2xl border border-border/40 bg-primary/10 px-4 py-2 text-sm text-foreground"
        >
          {bannerMessage}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <SettingsNav
              items={NAV_ITEMS}
              activeId={activeSection}
              onSelect={setActiveSection}
            />
          </div>
        </aside>

        <div className="min-w-0 space-y-4 md:space-y-5">
          <nav
            className="flex gap-2 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] scrollbar-none"
            aria-label="Secciones de configuración"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  document
                    .getElementById(item.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={
                  activeSection === item.id
                    ? "shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    : "shrink-0 rounded-full border border-border/40 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
                }
              >
                {item.label}
              </button>
            ))}
          </nav>

          <section id="cuenta" className="scroll-mt-24">
            <ProfileSummaryCard
              name={data.profile.fullName}
              email={data.profile.email}
              image={data.profile.image}
              emailVerified={data.emailVerified}
              role={data.role}
              memberSince={data.memberSince}
            />
          </section>

          <ProfileSettingsCard
            value={data.profile}
            registeredEmail={savedSnapshot.profile.email}
            emailVerified={data.emailVerified}
            r2Configured={r2Configured}
            isDirty={isSectionDirty("profile")}
            isSaving={savingSection === "profile"}
            message={sectionMessages.profile}
            error={sectionErrors.profile}
            onChange={(profile) => setData((d) => ({ ...d, profile }))}
            onSave={() => void saveSection("profile")}
            onCancel={() => cancelSection("profile")}
          />

          <IdentificationSettingsCard
            value={data.identification}
            isDirty={isSectionDirty("identification")}
            isSaving={savingSection === "identification"}
            message={sectionMessages.identification}
            error={sectionErrors.identification}
            onChange={(identification) =>
              setData((d) => ({ ...d, identification }))
            }
            onSave={() => void saveSection("identification")}
            onCancel={() => cancelSection("identification")}
          />

          <AddressSettingsCard
            addresses={data.addresses}
            isDirty={isSectionDirty("addresses")}
            isSaving={savingSection === "addresses"}
            message={sectionMessages.addresses}
            error={sectionErrors.addresses}
            onChange={(addresses) => setData((d) => ({ ...d, addresses }))}
            onSave={() => void saveSection("addresses")}
            onCancel={() => cancelSection("addresses")}
          />

          <NotificationPreferencesCard
            value={data.notifications}
            isDirty={isSectionDirty("notifications")}
            isSaving={savingSection === "notifications"}
            message={sectionMessages.notifications}
            error={sectionErrors.notifications}
            onChange={(notifications) =>
              setData((d) => ({ ...d, notifications }))
            }
            onSave={() => void saveSection("notifications")}
            onCancel={() => cancelSection("notifications")}
          />

          <PrivacySecuritySettingsCard
            value={data.privacy}
            isDirty={isSectionDirty("privacy")}
            isSaving={savingSection === "privacy"}
            message={sectionMessages.privacy}
            error={sectionErrors.privacy}
            onChange={(privacy) => setData((d) => ({ ...d, privacy }))}
            onSave={() => void saveSection("privacy")}
            onCancel={() => cancelSection("privacy")}
          />

          <AppPreferencesCard
            value={data.preferences}
            isDirty={isSectionDirty("preferences")}
            isSaving={savingSection === "preferences"}
            message={sectionMessages.preferences}
            error={sectionErrors.preferences}
            onChange={(preferences) => setData((d) => ({ ...d, preferences }))}
            onSave={() => void saveSection("preferences")}
            onCancel={() => cancelSection("preferences")}
          />

          <DangerZoneCard accountEmail={data.profile.email} />
        </div>
      </div>
    </div>
  );
}
