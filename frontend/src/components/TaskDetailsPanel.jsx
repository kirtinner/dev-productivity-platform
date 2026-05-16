export default function TaskDetailsPanel({ entry, value, onChange, onCommit, onEscape }) {
    return (
        <div className="task-details-panel">
            <div className="task-details-comment">
                <textarea
                    className="task-details-textarea"
                    value={entry ? value : ""}
                    disabled={!entry}
                    aria-label="Comment"
                    onChange={event => onChange(event.target.value)}
                    onBlur={onCommit}
                    onKeyDown={event => {
                        if (event.key === "Enter" && event.ctrlKey) {
                            event.preventDefault();
                            onCommit();
                        }

                        if (event.key === "Escape") {
                            event.preventDefault();
                            onEscape();
                        }
                    }}
                />
            </div>
        </div>
    );
}
