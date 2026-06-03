export type SettingsSectionControlProps = {
  isDirty: boolean;
  isSaving: boolean;
  message?: string;
  error?: string;
  onSave: () => void;
  onCancel: () => void;
};
