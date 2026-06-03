"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  saveAddressesSettingsAction,
  saveAppPreferencesAction,
  saveIdentificationSettingsAction,
  saveNotificationPreferencesAction,
  savePrivacySecuritySettingsAction,
  saveProfileSettingsAction,
} from "@/lib/settings/actions";
import type { SettingsSaveSection } from "@/lib/settings/sections";
import type { SettingsInitialData } from "@/lib/settings/types";

function getSectionValue(
  data: SettingsInitialData,
  section: SettingsSaveSection,
): unknown {
  return data[section];
}

export function useSettingsSections(initialData: SettingsInitialData) {
  const router = useRouter();
  const savedRef = useRef(structuredClone(initialData));
  const [data, setData] = useState(initialData);
  const [savingSection, setSavingSection] =
    useState<SettingsSaveSection | null>(null);
  const [sectionMessages, setSectionMessages] = useState<
    Partial<Record<SettingsSaveSection, string>>
  >({});
  const [sectionErrors, setSectionErrors] = useState<
    Partial<Record<SettingsSaveSection, string>>
  >({});

  const isSectionDirty = useCallback(
    (section: SettingsSaveSection) =>
      JSON.stringify(getSectionValue(data, section)) !==
      JSON.stringify(getSectionValue(savedRef.current, section)),
    [data],
  );

  const cancelSection = useCallback((section: SettingsSaveSection) => {
    setData((current) => ({
      ...current,
      [section]: structuredClone(savedRef.current[section]),
    }));
    setSectionErrors((prev) => {
      const next = { ...prev };
      delete next[section];
      return next;
    });
    setSectionMessages((prev) => {
      const next = { ...prev };
      delete next[section];
      return next;
    });
  }, []);

  const saveSection = useCallback(
    async (section: SettingsSaveSection) => {
      setSavingSection(section);
      setSectionErrors((prev) => {
        const next = { ...prev };
        delete next[section];
        return next;
      });
      setSectionMessages((prev) => {
        const next = { ...prev };
        delete next[section];
        return next;
      });

      let result: Awaited<ReturnType<typeof saveProfileSettingsAction>>;

      switch (section) {
        case "profile":
          result = await saveProfileSettingsAction(data.profile);
          break;
        case "identification":
          result = await saveIdentificationSettingsAction(data.identification);
          break;
        case "addresses":
          result = await saveAddressesSettingsAction(data.addresses);
          break;
        case "notifications":
          result = await saveNotificationPreferencesAction(data.notifications);
          break;
        case "privacy":
          result = await savePrivacySecuritySettingsAction(data.privacy);
          break;
        case "preferences":
          result = await saveAppPreferencesAction(data.preferences);
          break;
      }

      setSavingSection(null);

      if (!result.success) {
        setSectionErrors((prev) => ({
          ...prev,
          [section]: result.error,
        }));
        return;
      }

      savedRef.current = structuredClone(result.data);
      setData(result.data);
      if (result.message) {
        setSectionMessages((prev) => ({
          ...prev,
          [section]: result.message,
        }));
      }
      router.refresh();
    },
    [data, router],
  );

  return {
    data,
    setData,
    savedSnapshot: savedRef.current,
    savingSection,
    sectionMessages,
    sectionErrors,
    isSectionDirty,
    cancelSection,
    saveSection,
  };
}
