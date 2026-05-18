function formatHours(value) {
    return value.toFixed(2);
}

export default function WorklogEntriesTable({
    entries,
    selectedEntryId,
    onSelectEntry,
    onRequestEditEntry,
    onAddEntry,
    onDeleteEntry,
    organizations = [],
    validationErrorIds = [],
    hasDailyLimitViolation = false
}) {
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

    const selectEntry = (entry) => {
        onSelectEntry(entry.id);
    };

    const renderReadOnlyCell = (value, className = "") => (
        <span className={["worklog-readonly-cell", className].filter(Boolean).join(" ")}>
            {value}
        </span>
    );

    return (
        <div className="worklog-table-shell">
            <div className="worklog-toolbar">
                <div className="worklog-toolbar-title">Entries</div>
                <div className="worklog-toolbar-actions">
                    <button type="button" className="worklog-toolbar-add" onClick={onAddEntry}>
                        Add
                    </button>
                    <button
                        type="button"
                        className="worklog-toolbar-edit"
                        onClick={() => selectedEntryId && onRequestEditEntry(selectedEntryId)}
                        disabled={!selectedEntryId}
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        className="worklog-toolbar-delete worklog-toolbar-delete-separated"
                        onClick={() => onDeleteEntry(selectedEntryId)}
                        disabled={!selectedEntryId}
                    >
                        Delete
                    </button>
                </div>
            </div>
            <div className="worklog-table-scroll">
                <table className="worklog-table">
                    <colgroup>
                        <col className="worklog-col-organization" />
                        <col className="worklog-col-client" />
                        <col className="worklog-col-task" />
                        <col className="worklog-col-hours" />
                        <col className="worklog-col-total" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>Organization</th>
                            <th>Client</th>
                            <th>Task</th>
                            <th className="worklog-number-column">Hours</th>
                            <th className="worklog-number-column">Total Task Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(entry => {
                            const isSelected = selectedEntryId === entry.id;
                            const hasValidationError = validationErrorIds.includes(entry.id);
                            const organizationLabel = organizations.find(organization => organization.id === entry.organizationId)?.shortName
                                ?? entry.organizationName
                                ?? "";

                            return (
                                <tr
                                    key={entry.id}
                                    className={[
                                        isSelected ? "worklog-row-selected" : "",
                                        hasValidationError ? "worklog-row-validation-error" : ""
                                    ].filter(Boolean).join(" ")}
                                    onClick={() => selectEntry(entry)}
                                    onDoubleClick={() => onRequestEditEntry(entry.id)}
                                >
                                    <td>
                                        {renderReadOnlyCell(organizationLabel)}
                                    </td>
                                    <td>
                                        {renderReadOnlyCell(entry.clientName)}
                                    </td>
                                    <td>
                                        {renderReadOnlyCell(entry.taskName || "")}
                                    </td>
                                    <td className="worklog-number-column">
                                        {renderReadOnlyCell(formatHours(entry.hours))}
                                    </td>
                                    <td className="worklog-number-column">
                                        {renderReadOnlyCell(formatHours(entry.totalTaskHours))}
                                    </td>
                                </tr>
                            );
                        })}
                        <tr className="worklog-spacer-row" aria-hidden="true">
                            <td colSpan="5" />
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr className={hasDailyLimitViolation ? "worklog-footer-limit-error" : ""}>
                            <td>Daily Total</td>
                            <td />
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
