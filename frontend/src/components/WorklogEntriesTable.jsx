import { useRef, useState } from "react";

function formatHours(value) {
    return value.toFixed(2);
}

function isValidHoursInput(value) {
    return value === "" || /^\d*\.?\d*$/.test(value);
}

export default function WorklogEntriesTable({
    entries,
    selectedEntryId,
    onSelectEntry,
    onEntryHoursChange,
    onEntryMetaChange,
    onAddEntry,
    onDeleteEntry,
    clients = [],
    tasks = [],
    validationErrorIds = [],
    hasDailyLimitViolation = false
}) {
    const [editingCell, setEditingCell] = useState(null);
    const skipNextBlurSave = useRef(false);

    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

    const selectEntry = (entry) => {
        onSelectEntry(entry.id);
    };

    const startEditing = (entry) => {
        selectEntry(entry);
        skipNextBlurSave.current = false;
        setEditingCell({
            entryId: entry.id,
            field: "hours",
            draftValue: String(entry.hours)
        });
    };

    const startMetaEditing = (entry, field) => {
        selectEntry(entry);
        skipNextBlurSave.current = false;
        setEditingCell({
            entryId: entry.id,
            field
        });
    };

    const updateDraftValue = (value) => {
        if (!isValidHoursInput(value)) {
            return;
        }

        setEditingCell(current => ({
            ...current,
            draftValue: value
        }));
    };

    const saveEditing = () => {
        if (!editingCell) {
            return;
        }

        if (editingCell.field === "client" || editingCell.field === "task") {
            setEditingCell(null);
            return;
        }

        const nextHours = Number(editingCell.draftValue);

        if (editingCell.draftValue === "" || Number.isNaN(nextHours)) {
            setEditingCell(null);
            return;
        }

        onEntryHoursChange(editingCell.entryId, nextHours);
        setEditingCell(null);
    };

    const cancelEditing = () => {
        skipNextBlurSave.current = true;
        setEditingCell(null);
    };

    const handleHoursBlur = () => {
        if (skipNextBlurSave.current) {
            skipNextBlurSave.current = false;
            return;
        }

        saveEditing();
    };

    const handleEditKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            skipNextBlurSave.current = true;
            saveEditing();
        }

        if (event.key === "Escape") {
            event.preventDefault();
            cancelEditing();
        }
    };

    const handleMetaChange = (entryId, field, value) => {
        onEntryMetaChange(entryId, field, value);
        setEditingCell(null);
    };

    return (
        <div className="worklog-table-shell">
            <div className="worklog-toolbar">
                <div className="worklog-toolbar-title">Entries</div>
                <div className="worklog-toolbar-actions">
                    <button type="button" className="worklog-toolbar-add" onClick={onAddEntry}>
                        Add Entry
                    </button>
                    <button
                        type="button"
                        className="worklog-toolbar-delete"
                        onClick={() => onDeleteEntry(selectedEntryId)}
                        disabled={!selectedEntryId}
                    >
                        Delete Selected
                    </button>
                </div>
            </div>
            <div className="worklog-table-scroll">
                <table className="worklog-table">
                    <colgroup>
                        <col className="worklog-col-client" />
                        <col className="worklog-col-task" />
                        <col className="worklog-col-hours" />
                        <col className="worklog-col-total" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Task</th>
                            <th className="worklog-number-column">Hours</th>
                            <th className="worklog-number-column">Total Task Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(entry => {
                            const isEditing = editingCell?.entryId === entry.id;
                            const isSelected = selectedEntryId === entry.id;
                            const hasValidationError = validationErrorIds.includes(entry.id);
                            const availableTasks = entry.clientId == null
                                ? []
                                : tasks.filter(task => task.clientId === entry.clientId);

                            return (
                                <tr
                                    key={entry.id}
                                    className={[
                                        isSelected ? "worklog-row-selected" : "",
                                        isEditing ? "worklog-row-editing" : "",
                                        hasValidationError ? "worklog-row-validation-error" : ""
                                    ].filter(Boolean).join(" ")}
                                    onClick={() => selectEntry(entry)}
                                >
                                    <td>
                                        {editingCell?.entryId === entry.id && editingCell?.field === "client" ? (
                                            <select
                                                className="worklog-inline-select"
                                                value={String(entry.clientId ?? "")}
                                                onChange={event => handleMetaChange(entry.id, "client", event.target.value)}
                                                onBlur={() => setEditingCell(null)}
                                                autoFocus
                                            >
                                                <option value="">Select client</option>
                                                {clients.map(client => (
                                                    <option key={client.id} value={String(client.id)}>
                                                        {client.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <button
                                                type="button"
                                                className="worklog-inline-text"
                                                onClick={() => startMetaEditing(entry, "client")}
                                            >
                                                <span className="worklog-client">{entry.clientName}</span>
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        {editingCell?.entryId === entry.id && editingCell?.field === "task" ? (
                                            <select
                                                className="worklog-inline-select"
                                                value={String(entry.taskId ?? "")}
                                                disabled={entry.clientId == null || availableTasks.length === 0}
                                                onChange={event => handleMetaChange(entry.id, "task", event.target.value)}
                                                onBlur={() => setEditingCell(null)}
                                                autoFocus
                                            >
                                                <option value="">Select task</option>
                                                {availableTasks.map(task => (
                                                    <option key={task.id} value={String(task.id)}>
                                                        {task.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <button
                                                type="button"
                                                className="worklog-inline-text"
                                                onClick={() => {
                                                    if (entry.clientId == null || availableTasks.length === 0) {
                                                        return;
                                                    }

                                                    startMetaEditing(entry, "task");
                                                }}
                                                disabled={entry.clientId == null || availableTasks.length === 0}
                                            >
                                                <span className="worklog-task">{entry.taskName || ""}</span>
                                            </button>
                                        )}
                                    </td>
                                    <td className="worklog-number-column">
                                        {isEditing && editingCell?.field === "hours" ? (
                                            <input
                                                className="worklog-hours-input"
                                                value={editingCell.draftValue}
                                                onChange={event => updateDraftValue(event.target.value)}
                                                onBlur={handleHoursBlur}
                                                onKeyDown={handleEditKeyDown}
                                                autoFocus
                                                inputMode="decimal"
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                className="worklog-edit-ready"
                                                onClick={() => startEditing(entry)}
                                            >
                                                {formatHours(entry.hours)}
                                            </button>
                                        )}
                                    </td>
                                    <td className="worklog-number-column">
                                        {formatHours(entry.totalTaskHours)}
                                    </td>
                                </tr>
                            );
                        })}
                        <tr className="worklog-spacer-row" aria-hidden="true">
                            <td colSpan="4" />
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr className={hasDailyLimitViolation ? "worklog-footer-limit-error" : ""}>
                            <td>Daily Total</td>
                            <td />
                            <td className="worklog-number-column">
                                {formatHours(totalHours)}
                            </td>
                            <td className="worklog-number-column" />
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
