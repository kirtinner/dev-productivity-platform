import { createContext, useContext } from "react";

export const DEFAULT_USER_SETTINGS = {
    id: null,
    developerId: null,
    currentOrganizationId: null,
    currentOrganizationName: "",
    dailyHoursLimit: 8,
    reportsSaveDirectory: "",
    scheduledExportEnabled: false,
    scheduledExportFolder: "",
    scheduledExportTime: "02:00",
    scheduledExportRetentionDays: 30,
    scheduledExportLastRunAt: null,
    scheduledExportLastSuccessAt: null,
    scheduledExportLastErrorMessage: ""
};

export const UserSettingsContext = createContext({
    userSettings: DEFAULT_USER_SETTINGS,
    userSettingsLoading: false,
    userSettingsError: "",
    updateUserSettingsState: async () => DEFAULT_USER_SETTINGS
});

export function useUserSettings() {
    return useContext(UserSettingsContext);
}
