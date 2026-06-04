import { useEffect, useState } from "react";
import SoftwareProductsSettingsTable from "../components/SoftwareProductsSettingsTable";
import { validateFolder } from "../services/userSettingsService";

function getApiErrorMessage(error, fallbackMessage) {
    const responseData = error?.response?.data;
    const message = typeof responseData === "string"
        ? responseData
        : responseData?.message || responseData?.error || (responseData ? JSON.stringify(responseData) : error?.message);
    return message || fallbackMessage;
}

function DirectorySettingField({
    label,
    value,
    placeholder = "No directory selected",
    disabled = false,
    clearLabel,
    onChange,
    onValidate,
    onClear
}) {
    return (
        <label className="tracking-modal-field settings-directory-field">
            <span>{label}</span>
            <div className="settings-directory-control">
                <input
                    type="text"
                    value={value}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={event => onChange?.(event.target.value)}
                />
                <button type="button" className="tracking-save-button" onClick={onValidate} disabled={disabled}>
                    Validate Folder
                </button>
                <button
                    type="button"
                    className="selector-clear-button settings-directory-clear-button"
                    onClick={onClear}
                    aria-label={clearLabel}
                    disabled={disabled || !value}
                >
                    x
                </button>
            </div>
        </label>
    );
}

function SettingsResultDialog({ result, onClose }) {
    if (!result) {
        return null;
    }

    const success = Boolean(result.success);
    const title = result.title || (success ? "Folder Validation" : "Folder Validation Failed");
    const fileText = result.filePath || result.fileName || "";
    const pathText = result.path || "";

    return (
        <div className="tracking-modal-overlay" role="presentation">
            <div
                className="tracking-modal tracking-modal-confirm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-export-run-dialog-title"
            >
                <div className="tracking-modal-header">
                    <h3 id="settings-export-run-dialog-title">{title}</h3>
                </div>
                <div className="tracking-modal-body">
                    <p className="tracking-modal-text">
                        {result.message || (success ? "Folder is valid and writable." : "Folder validation failed.")}
                    </p>
                    {pathText ? (
                        <div className="settings-export-dialog-detail">
                            <span>Path:</span>
                            <strong>{pathText}</strong>
                        </div>
                    ) : null}
                    {success && fileText ? (
                        <div className="settings-export-dialog-detail">
                            <span>File:</span>
                            <strong>{fileText}</strong>
                        </div>
                    ) : null}
                    {!success && result.technicalDetails ? (
                        <div className="settings-export-dialog-detail">
                            <span>Technical details:</span>
                            <strong>{result.technicalDetails}</strong>
                        </div>
                    ) : null}
                </div>
                <div className="tracking-modal-actions">
                    <button type="button" className="tracking-modal-button" onClick={onClose}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage({
    organizations = [],
    softwareProducts = [],
    userSettings = { currentOrganizationId: null, dailyHoursLimit: 8, reportsSaveDirectory: "" },
    userSettingsLoading = false,
    userSettingsError = "",
    softwareProductsLoading = false,
    softwareProductsError = "",
    onUserSettingsChange = async () => userSettings,
    onRunScheduledExportNow = async () => ({ success: false, message: "Run Export Now is unavailable." }),
    onSoftwareProductsChange = () => {}
}) {
    const [settingsDraftLimit, setSettingsDraftLimit] = useState(String(userSettings.dailyHoursLimit ?? 8));
    const [settingsDraftOrganizationId, setSettingsDraftOrganizationId] = useState(String(userSettings.currentOrganizationId ?? ""));
    const [settingsDraftReportsSaveDirectory, setSettingsDraftReportsSaveDirectory] = useState(userSettings.reportsSaveDirectory ?? "");
    const [scheduledExportEnabled, setScheduledExportEnabled] = useState(Boolean(userSettings.scheduledExportEnabled));
    const [scheduledExportFolder, setScheduledExportFolder] = useState(userSettings.scheduledExportFolder ?? "");
    const [scheduledExportTime, setScheduledExportTime] = useState(userSettings.scheduledExportTime ?? "02:00");
    const [scheduledExportRetentionDays, setScheduledExportRetentionDays] = useState(String(userSettings.scheduledExportRetentionDays ?? 30));
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [resultDialog, setResultDialog] = useState(null);
    const [runNowExecuting, setRunNowExecuting] = useState(false);

    useEffect(() => {
        setSettingsDraftLimit(String(userSettings.dailyHoursLimit ?? 8));
        setSettingsDraftOrganizationId(String(userSettings.currentOrganizationId ?? ""));
        setSettingsDraftReportsSaveDirectory(userSettings.reportsSaveDirectory ?? "");
        setScheduledExportEnabled(Boolean(userSettings.scheduledExportEnabled));
        setScheduledExportFolder(userSettings.scheduledExportFolder ?? "");
        setScheduledExportTime(userSettings.scheduledExportTime ?? "02:00");
        setScheduledExportRetentionDays(String(userSettings.scheduledExportRetentionDays ?? 30));
    }, [
        userSettings.currentOrganizationId,
        userSettings.dailyHoursLimit,
        userSettings.reportsSaveDirectory,
        userSettings.scheduledExportEnabled,
        userSettings.scheduledExportFolder,
        userSettings.scheduledExportTime,
        userSettings.scheduledExportRetentionDays
    ]);


    const handleSaveUserSettings = async () => {
        const parsedLimit = Number(settingsDraftLimit);
        const parsedRetentionDays = Number(scheduledExportRetentionDays);

        setResultDialog(null);

        if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
            setResultDialog({ success: false, title: "User Settings Failed", message: "Daily hours limit must be greater than 0." });
            return;
        }

        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(scheduledExportTime)) {
            setResultDialog({ success: false, title: "User Settings Failed", message: "Run Daily At must use HH:mm format." });
            return;
        }

        if (!Number.isInteger(parsedRetentionDays) || parsedRetentionDays < 0) {
            setResultDialog({ success: false, title: "User Settings Failed", message: "Retention Days must be 0 or greater." });
            return;
        }

        setSettingsSaving(true);
        try {
            await onUserSettingsChange({
                currentOrganizationId: settingsDraftOrganizationId ? Number(settingsDraftOrganizationId) : null,
                dailyHoursLimit: parsedLimit,
                reportsSaveDirectory: settingsDraftReportsSaveDirectory,
                scheduledExportEnabled,
                scheduledExportFolder,
                scheduledExportTime,
                scheduledExportRetentionDays: parsedRetentionDays
            });
            setResultDialog({ success: true, title: "User Settings", message: "User settings saved." });
        } catch (error) {
            setResultDialog({ success: false, title: "User Settings Failed", message: getApiErrorMessage(error, "Unable to save user settings."), technicalDetails: error?.message ?? "" });
        } finally {
            setSettingsSaving(false);
        }
    };

    const handleSoftwareProductsChange = (nextProductsOrUpdater) => {
        const nextProducts = typeof nextProductsOrUpdater === "function"
            ? nextProductsOrUpdater(softwareProducts)
            : nextProductsOrUpdater;
        onSoftwareProductsChange(nextProducts.map(product => ({ ...product })));
    };

    const handleValidateFolder = async (label, path) => {
        setResultDialog(null);

        try {
            const result = await validateFolder(path);
            setResultDialog({
                ...result,
                title: result.success ? "Folder Validation" : "Folder Validation Failed"
            });
        } catch (error) {
            setResultDialog({
                success: false,
                title: "Folder Validation Failed",
                message: getApiErrorMessage(error, `${label} validation failed.`),
                technicalDetails: error?.message ?? ""
            });
        }
    };

    const handleClearReportsSaveDirectory = () => {
        setSettingsDraftReportsSaveDirectory("");
    };

    const handleClearScheduledExportFolder = () => {
        setScheduledExportFolder("");
    };

    const handleCancelUserSettings = () => {
        setResultDialog(null);
        setSettingsDraftLimit(String(userSettings.dailyHoursLimit ?? 8));
        setSettingsDraftOrganizationId(String(userSettings.currentOrganizationId ?? ""));
        setSettingsDraftReportsSaveDirectory(userSettings.reportsSaveDirectory ?? "");
        setScheduledExportEnabled(Boolean(userSettings.scheduledExportEnabled));
        setScheduledExportFolder(userSettings.scheduledExportFolder ?? "");
        setScheduledExportTime(userSettings.scheduledExportTime ?? "02:00");
        setScheduledExportRetentionDays(String(userSettings.scheduledExportRetentionDays ?? 30));
    };

    const handleRunExportNow = async () => {
        setResultDialog(null);
        setRunNowExecuting(true);

        try {
            const result = await onRunScheduledExportNow();
            setResultDialog({ ...result, title: result.success ? "Full Data Export" : "Full Data Export failed" });
        } catch (error) {
            setResultDialog({
                success: false,
                title: "Full Data Export failed",
                message: getApiErrorMessage(error, "Unable to run scheduled export."),
                technicalDetails: error?.message ?? ""
            });
        } finally {
            setRunNowExecuting(false);
        }
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleString();
    };

    return (
        <div className="tracking-main organizations-main settings-main">
            <header className="tracking-topbar">
                <div className="tracking-topbar-main">
                    <div>
                        <h2>Settings</h2>
                    </div>
                </div>
            </header>

            <div className="settings-page-stack">
                <section className="tracking-panel organizations-panel">
                    <div className="tracking-panel-header organizations-panel-header">
                        <div>
                            <h3>User Settings</h3>
                        </div>
                        <div className="settings-user-actions">
                            <button
                                type="button"
                                className="tracking-modal-button tracking-modal-button-secondary"
                                onClick={handleCancelUserSettings}
                                disabled={userSettingsLoading || settingsSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="tracking-save-button"
                                onClick={handleSaveUserSettings}
                                disabled={userSettingsLoading || settingsSaving}
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="tracking-panel-body">
                        <div className="settings-form-grid">
                            <label className="tracking-modal-field">
                                <span>Daily Hours Limit</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.25"
                                    value={settingsDraftLimit}
                                    onChange={event => setSettingsDraftLimit(event.target.value)}
                                    disabled={userSettingsLoading || settingsSaving}
                                />
                            </label>

                            <label className="tracking-modal-field">
                                <span>Current Organization</span>
                                <div className="selector-clear-control">
                                    <select
                                        value={settingsDraftOrganizationId}
                                        onChange={event => setSettingsDraftOrganizationId(event.target.value)}
                                        disabled={userSettingsLoading || settingsSaving}
                                    >
                                        <option value=""></option>
                                        {organizations.map(organization => (
                                            <option key={organization.id} value={String(organization.id)}>
                                                {organization.shortName}
                                            </option>
                                        ))}
                                    </select>
                                    {settingsDraftOrganizationId !== "" && (
                                        <button type="button" className="selector-clear-button" onClick={() => setSettingsDraftOrganizationId("")} aria-label="Clear current organization">
                                            x
                                        </button>
                                    )}
                                </div>
                            </label>

                            <DirectorySettingField
                                label="Reports Save Directory"
                                value={settingsDraftReportsSaveDirectory}
                                disabled={userSettingsLoading || settingsSaving}
                                clearLabel="Clear reports save directory"
                                onChange={setSettingsDraftReportsSaveDirectory}
                                onValidate={() => handleValidateFolder("Reports Save Directory", settingsDraftReportsSaveDirectory)}
                                onClear={handleClearReportsSaveDirectory}
                            />
                        </div>

                        <div className="settings-subsection">
                            <div className="settings-subsection-header">
                                <h4>Scheduled Full Data Export</h4>
                                <button
                                    type="button"
                                    className="tracking-save-button"
                                    onClick={handleRunExportNow}
                                    disabled={userSettingsLoading || settingsSaving || runNowExecuting}
                                >
                                    Run Export Now
                                </button>
                            </div>

                            <div className="settings-scheduled-grid">
                                <div className="tracking-modal-field settings-checkbox-field">
                                    <span></span>
                                    <label className="tracking-modal-checkbox-control settings-inline-checkbox-control">
                                        <input
                                            type="checkbox"
                                            checked={scheduledExportEnabled}
                                            onChange={event => setScheduledExportEnabled(event.target.checked)}
                                            disabled={userSettingsLoading || settingsSaving}
                                        />
                                        <span>Enable Scheduled Export</span>
                                    </label>
                                </div>

                                <DirectorySettingField
                                    label="Export Folder"
                                    value={scheduledExportFolder}
                                    placeholder="D:/YandexDisk/DevProductivityPlatform/Backups"
                                    disabled={userSettingsLoading || settingsSaving}
                                    clearLabel="Clear export folder"
                                    onChange={setScheduledExportFolder}
                                    onValidate={() => handleValidateFolder("Export Folder", scheduledExportFolder)}
                                    onClear={handleClearScheduledExportFolder}
                                />

                                <label className="tracking-modal-field settings-compact-field">
                                    <span>Run Daily At</span>
                                    <input
                                        type="time"
                                        value={scheduledExportTime}
                                        onChange={event => setScheduledExportTime(event.target.value)}
                                        disabled={userSettingsLoading || settingsSaving}
                                    />
                                </label>

                                <label className="tracking-modal-field settings-compact-field">
                                    <span>Retention Days</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={scheduledExportRetentionDays}
                                        onChange={event => setScheduledExportRetentionDays(event.target.value)}
                                        disabled={userSettingsLoading || settingsSaving}
                                    />
                                </label>

                                <label className="tracking-modal-field">
                                    <span>Last Run</span>
                                    <input type="text" value={formatDateTime(userSettings.scheduledExportLastRunAt)} readOnly />
                                </label>

                                <label className="tracking-modal-field">
                                    <span>Last Success</span>
                                    <input type="text" value={formatDateTime(userSettings.scheduledExportLastSuccessAt)} readOnly />
                                </label>

                                <label className="tracking-modal-field settings-directory-field">
                                    <span>Last Error</span>
                                    <input type="text" value={userSettings.scheduledExportLastErrorMessage ?? ""} readOnly />
                                </label>
                            </div>
                        </div>

                        {userSettingsError ? (
                            <div className="tracking-modal-error">User settings: {userSettingsError}</div>
                        ) : null}
                    </div>
                </section>

                <section className="settings-section-shell">
                    <div className="settings-section-actions">
                        <div>
                            {softwareProductsError ? (
                                <div className="tracking-modal-error">Software products: {softwareProductsError}</div>
                            ) : null}
                        </div>
                    </div>
                    <SoftwareProductsSettingsTable
                        softwareProducts={softwareProducts}
                        onSoftwareProductsChange={handleSoftwareProductsChange}
                    />
                </section>
            </div>

            <SettingsResultDialog
                result={resultDialog}
                onClose={() => setResultDialog(null)}
            />
        </div>
    );
}











