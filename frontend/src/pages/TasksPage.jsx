import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getClients as loadClients } from "../services/clientsService";
import { getProjects as loadProjects } from "../services/projectsService";
import {
    createTask as apiCreateTask,
    deleteTask as apiDeleteTask,
    getTasks as loadTasks,
    updateTask as apiUpdateTask
} from "../services/tasksService";

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

function createTaskDraft(context) {
    return {
        id: null,
        completed: false,
        created_at: todayIso(),
        task_number: "",
        name: "",
        description: "",
        implementation_details: "",
        estimated_hours: 0,
        softwareProductId: null,
        organizationId: context.organizationId ?? null,
        clientId: context.clientId ?? null,
        projectId: context.projectId ?? null
    };
}

function validateTask(task, softwareProducts) {
    const issues = [];

    if (!task.task_number.trim()) {
        issues.push("task_number is required.");
    }

    if (!task.name.trim()) {
        issues.push("name is required.");
    }

    if (task.organizationId == null) {
        issues.push("organization is required.");
    }

    if (task.clientId == null) {
        issues.push("client is required.");
    }

    if (task.projectId == null) {
        issues.push("project is required.");
    }

    if (softwareProducts.length === 0) {
        issues.push("No software products are available. Add software products in Settings.");
    } else if (task.softwareProductId == null) {
        issues.push("software_product is required.");
    }

    if (Number(task.estimated_hours) < 0) {
        issues.push("estimated_hours must be greater than or equal to 0.");
    }

    return issues;
}

function formatDate(value) {
    if (!value) {
        return "";
    }

    const [year, month, day] = value.split("-");
    if (!year || !month || !day) {
        return value;
    }

    return `${day}.${month}.${year}`;
}

function resolveSoftwareProductLabel(softwareProducts, softwareProductId) {
    return softwareProducts.find(product => sameId(product.id, softwareProductId))?.shortName ?? "";
}

function resolveClientLabel(clients, clientId) {
    return clients.find(client => sameId(client.id, clientId))?.shortName ?? "";
}

function sameId(left, right) {
    return left != null && right != null && String(left) === String(right);
}

export default function TasksPage({
    organizations = [],
    currentOrganizationId = null,
    softwareProducts = []
}) {
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedOrganizationId, setSelectedOrganizationId] = useState(currentOrganizationId ?? organizations[0]?.id ?? null);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editorMode, setEditorMode] = useState(null); // "add" | "edit"
    const [draftTask, setDraftTask] = useState(null);
    const [originalDraftTask, setOriginalDraftTask] = useState(null);
    const [pendingSelectionId, setPendingSelectionId] = useState(null);
    const [pendingFilterSelection, setPendingFilterSelection] = useState(null);
    const [validationDialogOpen, setValidationDialogOpen] = useState(false);
    const [validationIssues, setValidationIssues] = useState([]);
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
    const handleCancelRef = useRef(() => {});

    const filteredTasks = useMemo(
        () => tasks.filter(task =>
            sameId(task.organizationId, selectedOrganizationId)
            && sameId(task.clientId, selectedClientId)
            && sameId(task.projectId, selectedProjectId)
        ),
        [tasks, selectedClientId, selectedOrganizationId, selectedProjectId]
    );

    const selectedTask = tasks.find(task => sameId(task.id, selectedTaskId)) ?? null;
    const isDraftDirty = editorOpen && draftTask && originalDraftTask && (
        draftTask.completed !== originalDraftTask.completed
        || draftTask.created_at !== originalDraftTask.created_at
        || draftTask.task_number !== originalDraftTask.task_number
        || draftTask.name !== originalDraftTask.name
        || draftTask.description !== originalDraftTask.description
        || draftTask.implementation_details !== originalDraftTask.implementation_details
        || Number(draftTask.estimated_hours) !== Number(originalDraftTask.estimated_hours)
        || draftTask.softwareProductId !== originalDraftTask.softwareProductId
        || draftTask.organizationId !== originalDraftTask.organizationId
        || draftTask.clientId !== originalDraftTask.clientId
        || draftTask.projectId !== originalDraftTask.projectId
    );
    const taskCountLabel = `${filteredTasks.length} task${filteredTasks.length === 1 ? "" : "s"}`;

    useEffect(() => {
        let active = true;

        async function loadData() {
            try {
                const [nextClients, nextProjects, nextTasks] = await Promise.all([
                    loadClients(),
                    loadProjects(),
                    loadTasks()
                ]);

                if (!active) {
                    return;
                }

                setClients(nextClients);
                setProjects(nextProjects);
                setTasks(nextTasks);

                const initialOrganizationId = currentOrganizationId ?? organizations[0]?.id ?? nextClients[0]?.organizationId ?? null;
                const initialClients = nextClients.filter(client => sameId(client.organizationId, initialOrganizationId));
                const initialClientId = initialClients[0]?.id ?? null;
                const initialProjects = nextProjects.filter(project =>
                    sameId(project.organizationId, initialOrganizationId)
                    && sameId(project.clientId, initialClientId)
                );
                const initialProjectId = initialProjects[0]?.id ?? null;
                const initialTaskId = nextTasks.find(task =>
                    sameId(task.organizationId, initialOrganizationId)
                    && sameId(task.clientId, initialClientId)
                    && sameId(task.projectId, initialProjectId)
                )?.id ?? null;

                setSelectedOrganizationId(initialOrganizationId);
                setSelectedClientId(initialClientId);
                setSelectedProjectId(initialProjectId);
                setSelectedTaskId(initialTaskId);
            } catch {
                if (!active) {
                    return;
                }
            }
        }

        loadData();

        return () => {
            active = false;
        };
    }, [currentOrganizationId, organizations]);

    const closeTransientDialogs = useCallback(() => {
        setValidationDialogOpen(false);
        setValidationIssues([]);
        setWarningDialogOpen(false);
        setWarningMessage("");
        setSwitchDialogOpen(false);
        setPendingSelectionId(null);
        setPendingFilterSelection(null);
    }, []);

    const closeEditor = useCallback(() => {
        setEditorOpen(false);
        setEditorMode(null);
        setDraftTask(null);
        setOriginalDraftTask(null);
        closeTransientDialogs();
    }, [closeTransientDialogs]);

    const getContextDefaults = (organizationId, clientId = null, projectId = null) => {
        const nextOrganizationClients = clients.filter(client => sameId(client.organizationId, organizationId));
        const resolvedClientId = clientId != null && nextOrganizationClients.some(client => sameId(client.id, clientId))
            ? clientId
            : nextOrganizationClients[0]?.id ?? null;

        const nextProjects = projects.filter(project =>
            sameId(project.organizationId, organizationId)
            && sameId(project.clientId, resolvedClientId)
        );
        const resolvedProjectId = projectId != null && nextProjects.some(project => sameId(project.id, projectId))
            ? projectId
            : nextProjects[0]?.id ?? null;

        return {
            organizationId,
            clientId: resolvedClientId,
            projectId: resolvedProjectId
        };
    };

    const openEditorForExisting = (task) => {
        setEditorOpen(true);
        setEditorMode("edit");
        setDraftTask({
            ...task,
            softwareProductId: task.softwareProductId ?? null
        });
        setOriginalDraftTask({
            ...task,
            softwareProductId: task.softwareProductId ?? null
        });
        setSelectedTaskId(task.id);
        closeTransientDialogs();
    };

    const openEditorForNew = () => {
        const defaults = getContextDefaults(selectedOrganizationId, selectedClientId, selectedProjectId);
        const nextDraft = createTaskDraft(defaults);

        setEditorOpen(true);
        setEditorMode("add");
        setDraftTask(nextDraft);
        setOriginalDraftTask({ ...nextDraft });
        closeTransientDialogs();
    };

    const applyFilterSelection = (organizationId, clientId = null, projectId = null) => {
        const defaults = getContextDefaults(organizationId, clientId, projectId);
        setSelectedOrganizationId(defaults.organizationId);
        setSelectedClientId(defaults.clientId);
        setSelectedProjectId(defaults.projectId);
        setSelectedTaskId(
            tasks.find(task =>
                sameId(task.organizationId, defaults.organizationId)
                && sameId(task.clientId, defaults.clientId)
                && sameId(task.projectId, defaults.projectId)
            )?.id ?? null
        );
    };

    const handleRowSelect = (task) => {
        if (editorOpen) {
            if (!isDraftDirty) {
                setSelectedTaskId(task.id);
                openEditorForExisting(task);
                return;
            }

            setPendingSelectionId(task.id);
            setSwitchDialogOpen(true);
            return;
        }

        setSelectedTaskId(task.id);
    };

    const handleRowEditRequest = (task) => {
        if (editorOpen) {
            if (!isDraftDirty) {
                openEditorForExisting(task);
                return;
            }

            setPendingSelectionId(task.id);
            setSwitchDialogOpen(true);
            return;
        }

        openEditorForExisting(task);
    };

    const handleAddTask = () => {
        if (editorOpen) {
            return;
        }

        openEditorForNew();
    };

    const handleEditTask = () => {
        if (selectedTask && !editorOpen) {
            openEditorForExisting(selectedTask);
        }
    };

    const handleDeleteTask = async () => {
        if (!selectedTask || editorOpen) {
            return;
        }

        try {
            await apiDeleteTask(selectedTask.id);
            setTasks(currentTasks => currentTasks.filter(task => task.id !== selectedTask.id));
            const remaining = filteredTasks.filter(task => task.id !== selectedTask.id);
            setSelectedTaskId(remaining[0]?.id ?? null);
            closeTransientDialogs();
        } catch (error) {
            const message =
                error?.response?.data?.message ??
                error?.response?.data?.error ??
                error?.message ??
                "Task is used in the system and cannot be deleted.";
            setWarningMessage(message);
            setWarningDialogOpen(true);
        }
    };

    const handleDraftChange = (field, value) => {
        setDraftTask(current => (current ? {
            ...current,
            [field]: value
        } : current));
    };

    const handleDraftOrganizationChange = (nextOrganizationId) => {
        if (!draftTask) {
            return;
        }

        const parsedOrganizationId = nextOrganizationId === "" ? null : Number(nextOrganizationId);
        if (parsedOrganizationId == null) {
            handleDraftChange("organizationId", null);
            handleDraftChange("clientId", null);
            handleDraftChange("projectId", null);
            return;
        }

        const nextDefaults = getContextDefaults(parsedOrganizationId);
        setDraftTask(current => (current ? {
            ...current,
            organizationId: nextDefaults.organizationId,
            clientId: nextDefaults.clientId,
            projectId: nextDefaults.projectId
        } : current));
    };

    const handleDraftClientChange = (nextClientId) => {
        if (!draftTask) {
            return;
        }

        const parsedClientId = nextClientId === "" ? null : Number(nextClientId);
        if (parsedClientId == null) {
            handleDraftChange("clientId", null);
            handleDraftChange("projectId", null);
            return;
        }

        const nextProjects = projects.filter(project =>
            sameId(project.organizationId, draftTask.organizationId)
            && sameId(project.clientId, parsedClientId)
        );

        setDraftTask(current => (current ? {
            ...current,
            clientId: parsedClientId,
            projectId: nextProjects[0]?.id ?? null
        } : current));
    };

    const handleDraftProjectChange = (nextProjectId) => {
        const parsedProjectId = nextProjectId === "" ? null : Number(nextProjectId);
        handleDraftChange("projectId", parsedProjectId);
    };

    const handleDraftSoftwareProductChange = (nextSoftwareProductId) => {
        const parsedSoftwareProductId = nextSoftwareProductId === "" ? null : Number(nextSoftwareProductId);
        handleDraftChange("softwareProductId", parsedSoftwareProductId);
    };

    const handleCompletedChange = (checked) => {
        handleDraftChange("completed", checked);
    };

    const handleEstimatedHoursChange = (value) => {
        if (!draftTask) {
            return;
        }

        if (value === "") {
            handleDraftChange("estimated_hours", 0);
            return;
        }

        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
            handleDraftChange("estimated_hours", parsed);
        }
    };

    const handleOrganizationChange = (nextOrganizationId) => {
        const parsedOrganizationId = Number(nextOrganizationId);

        if (editorOpen && isDraftDirty) {
            setPendingFilterSelection({ organizationId: parsedOrganizationId, clientId: null, projectId: null });
            setSwitchDialogOpen(true);
            return;
        }

        if (editorOpen) {
            closeEditor();
        }

        applyFilterSelection(parsedOrganizationId);
        closeTransientDialogs();
    };

    const handleClientChange = (nextClientId) => {
        const parsedClientId = nextClientId === "" ? null : Number(nextClientId);

        if (editorOpen && isDraftDirty) {
            setPendingFilterSelection({
                organizationId: selectedOrganizationId,
                clientId: parsedClientId,
                projectId: null
            });
            setSwitchDialogOpen(true);
            return;
        }

        if (editorOpen) {
            closeEditor();
        }

        if (parsedClientId == null) {
            setSelectedClientId(null);
            setSelectedProjectId(null);
            setSelectedTaskId(null);
            closeTransientDialogs();
            return;
        }

        const nextProjects = projects.filter(project =>
            sameId(project.organizationId, selectedOrganizationId)
            && sameId(project.clientId, parsedClientId)
        );

        setSelectedClientId(parsedClientId);
        setSelectedProjectId(nextProjects[0]?.id ?? null);
        setSelectedTaskId(tasks.find(task =>
            sameId(task.organizationId, selectedOrganizationId)
            && sameId(task.clientId, parsedClientId)
            && sameId(task.projectId, nextProjects[0]?.id)
        )?.id ?? null);
        closeTransientDialogs();
    };

    const handleProjectChange = (nextProjectId) => {
        const parsedProjectId = nextProjectId === "" ? null : Number(nextProjectId);

        if (editorOpen && isDraftDirty) {
            setPendingFilterSelection({
                organizationId: selectedOrganizationId,
                clientId: selectedClientId,
                projectId: parsedProjectId
            });
            setSwitchDialogOpen(true);
            return;
        }

        if (editorOpen) {
            closeEditor();
        }

        setSelectedProjectId(parsedProjectId);
        setSelectedTaskId(tasks.find(task =>
            sameId(task.organizationId, selectedOrganizationId)
            && sameId(task.clientId, selectedClientId)
            && sameId(task.projectId, parsedProjectId)
        )?.id ?? null);
        closeTransientDialogs();
    };

    const handleSaveTask = async () => {
        if (!draftTask) {
            return;
        }

        const issues = validateTask(draftTask, softwareProducts);
        if (issues.length > 0) {
            setValidationIssues(issues);
            setValidationDialogOpen(true);
            return;
        }

        try {
            const isNewTask = editorMode === "add";
            const savedTask = isNewTask
                ? await apiCreateTask(draftTask)
                : await apiUpdateTask(draftTask.id, draftTask);
            const normalizedTask = {
                ...draftTask,
                ...savedTask,
                softwareProductId: draftTask.softwareProductId ?? savedTask.softwareProductId ?? null
            };

            setTasks(currentTasks =>
                isNewTask
                    ? [...currentTasks, normalizedTask]
                    : currentTasks.map(task =>
                        sameId(task.id, draftTask.id)
                            ? normalizedTask
                            : task
                    )
            );
            setSelectedTaskId(normalizedTask.id);
            closeEditor();
        } catch (error) {
            const message =
                error?.response?.data?.message ??
                error?.response?.data?.error ??
                error?.message ??
                "Unable to save task.";
            setWarningMessage(message);
            setWarningDialogOpen(true);
        }
    };

    const handleCancelTask = () => {
        if (!editorOpen) {
            return;
        }

        closeEditor();
    };

    const handleSaveFromSwitchDialog = async () => {
        if (!draftTask) {
            return;
        }

        const issues = validateTask(draftTask, softwareProducts);
        if (issues.length > 0) {
            setValidationIssues(issues);
            setValidationDialogOpen(true);
            return;
        }

        try {
            const isNewTask = editorMode === "add";
            const savedTask = isNewTask
                ? await apiCreateTask(draftTask)
                : await apiUpdateTask(draftTask.id, draftTask);
            const normalizedTask = {
                ...draftTask,
                ...savedTask,
                softwareProductId: draftTask.softwareProductId ?? savedTask.softwareProductId ?? null
            };

            setTasks(currentTasks =>
                isNewTask
                    ? [...currentTasks, normalizedTask]
                    : currentTasks.map(task =>
                        sameId(task.id, draftTask.id)
                            ? normalizedTask
                            : task
                    )
            );
            setSelectedTaskId(pendingSelectionId ?? normalizedTask.id);

            if (pendingFilterSelection != null) {
                applyFilterSelection(
                    pendingFilterSelection.organizationId,
                    pendingFilterSelection.clientId,
                    pendingFilterSelection.projectId
                );
            }

            setEditorOpen(false);
            setEditorMode(null);
            setDraftTask(null);
            setOriginalDraftTask(null);
            setSwitchDialogOpen(false);
            setPendingSelectionId(null);
            setPendingFilterSelection(null);
        } catch (error) {
            const message =
                error?.response?.data?.message ??
                error?.response?.data?.error ??
                error?.message ??
                "Unable to save task.";
            setWarningMessage(message);
            setWarningDialogOpen(true);
        }
    };

    const handleDiscardFromSwitchDialog = () => {
        if (pendingFilterSelection != null) {
            applyFilterSelection(
                pendingFilterSelection.organizationId,
                pendingFilterSelection.clientId,
                pendingFilterSelection.projectId
            );
        } else if (pendingSelectionId != null) {
            setSelectedTaskId(pendingSelectionId);
        }

        closeEditor();
    };

    const handleStayEditing = () => {
        setSwitchDialogOpen(false);
        setPendingSelectionId(null);
        setPendingFilterSelection(null);
    };

    useEffect(() => {
        handleCancelRef.current = () => {
            if (!editorOpen) {
                return;
            }

            closeEditor();
        };
    }, [editorOpen, closeEditor]);

    useEffect(() => {
        if (!editorOpen || validationDialogOpen || warningDialogOpen || switchDialogOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key !== "Escape") {
                return;
            }

            event.preventDefault();
            handleCancelRef.current();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [editorOpen, switchDialogOpen, validationDialogOpen, warningDialogOpen]);

    const renderRow = (task) => {
        const isSelected = sameId(task.id, selectedTaskId);

        return (
            <tr
                key={task.id}
                className={isSelected ? "organizations-row-selected" : ""}
                onClick={() => handleRowSelect(task)}
                onDoubleClick={() => handleRowEditRequest(task)}
            >
                <td>
                    <input type="checkbox" checked={task.completed} disabled onClick={event => event.stopPropagation()} readOnly />
                </td>
                <td>{formatDate(task.created_at)}</td>
                <td>{task.task_number}</td>
                <td>{resolveClientLabel(clients, task.clientId)}</td>
                <td>{task.name}</td>
                <td>{Number(task.estimated_hours).toFixed(2)}</td>
                <td>{resolveSoftwareProductLabel(softwareProducts, task.softwareProductId ?? null) || task.softwareProductName || ""}</td>
            </tr>
        );
    };

    const filterClients = useMemo(
        () => clients.filter(client => sameId(client.organizationId, selectedOrganizationId)),
        [clients, selectedOrganizationId]
    );
    const filterProjects = useMemo(
        () => projects.filter(project =>
            sameId(project.organizationId, selectedOrganizationId)
            && sameId(project.clientId, selectedClientId)
        ),
        [projects, selectedClientId, selectedOrganizationId]
    );
    const editorClients = draftTask
        ? clients.filter(client => sameId(client.organizationId, draftTask.organizationId))
        : [];
    const editorProjects = draftTask
        ? projects.filter(project =>
            sameId(project.organizationId, draftTask.organizationId)
            && sameId(project.clientId, draftTask.clientId)
        )
        : [];

    return (
        <div className="tracking-main organizations-main" data-dirty={editorOpen && isDraftDirty ? "true" : "false"}>
            <header className="tracking-topbar">
                <div className="tracking-topbar-main">
                    <div>
                        <h2>Tasks</h2>
                        <p>Master data workspace for task records</p>
                    </div>
                </div>
            </header>

            <section className="tasks-filter-bar">
                <div className="tasks-filter-field">
                    <label className="clients-filter-label" htmlFor="tasks-organization-select">
                        Organization
                    </label>
                    <select
                        id="tasks-organization-select"
                        className="clients-filter-select tasks-filter-select"
                        value={String(selectedOrganizationId ?? "")}
                        onChange={event => handleOrganizationChange(event.target.value)}
                    >
                        {organizations.map(organization => (
                            <option key={organization.id} value={String(organization.id)}>
                                {organization.shortName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="tasks-filter-field">
                    <label className="clients-filter-label" htmlFor="tasks-client-select">
                        Client
                    </label>
                    <select
                        id="tasks-client-select"
                        className="clients-filter-select tasks-filter-select"
                        value={String(selectedClientId ?? "")}
                        onChange={event => handleClientChange(event.target.value)}
                        disabled={editorOpen && isDraftDirty ? false : filterClients.length === 0}
                    >
                        {filterClients.length === 0 ? (
                            <option value="">No clients</option>
                        ) : (
                            filterClients.map(client => (
                                <option key={client.id} value={String(client.id)}>
                                    {client.shortName}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div className="tasks-filter-field">
                    <label className="clients-filter-label" htmlFor="tasks-project-select">
                        Project
                    </label>
                    <select
                        id="tasks-project-select"
                        className="clients-filter-select tasks-filter-select"
                        value={String(selectedProjectId ?? "")}
                        onChange={event => handleProjectChange(event.target.value)}
                        disabled={filterProjects.length === 0}
                    >
                        {filterProjects.length === 0 ? (
                            <option value="">No projects</option>
                        ) : (
                            filterProjects.map(project => (
                                <option key={project.id} value={String(project.id)}>
                                    {project.shortName}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </section>

            <div className="tracking-content-grid organizations-content-grid">
                <section className="tracking-panel organizations-panel">
                    <div className="tracking-panel-header organizations-panel-header">
                        <div>
                            <h3>Task List</h3>
                            <p className="organizations-subtitle">{taskCountLabel}</p>
                        </div>

                        <div className="organizations-toolbar">
                            <div className="organizations-toolbar-actions">
                                <button
                                    type="button"
                                    className="tracking-save-button"
                                    onClick={handleAddTask}
                                    disabled={editorOpen}
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    className="tracking-save-button"
                                    onClick={handleEditTask}
                                    disabled={editorOpen || !selectedTask}
                                >
                                    Edit
                                </button>
                            </div>
                            <button
                                type="button"
                                className="organizations-delete-button organizations-delete-button-separated"
                                onClick={handleDeleteTask}
                                disabled={editorOpen || !selectedTask}
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className="tracking-panel-body organizations-panel-body">
                        <table className="app-master-data-table tasks-table">
                            <colgroup>
                                <col className="tasks-col-completed" />
                                <col className="tasks-col-date" />
                                <col className="tasks-col-number" />
                                <col className="tasks-col-client" />
                                <col className="tasks-col-name" />
                                <col className="tasks-col-hours" />
                                <col className="tasks-col-software" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Completed</th>
                                    <th>Created Date</th>
                                    <th>Task Number</th>
                                    <th>Client</th>
                                    <th>Name</th>
                                    <th>Estimated Hours</th>
                                    <th>Software Product</th>
                                </tr>
                            </thead>
                            <tbody>{filteredTasks.map(renderRow)}</tbody>
                        </table>
                    </div>
                </section>
            </div>

            {editorOpen && draftTask && (
                <div className="tracking-modal-overlay" role="presentation">
                    <div
                        className="tracking-modal tracking-modal-confirm tracking-modal-task-editor"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="tasks-editor-title"
                    >
                        <div className="tracking-modal-header">
                            <h3 id="tasks-editor-title">{editorMode === "add" ? "Add Task" : "Edit Task"}</h3>
                        </div>
                        <div className="tracking-modal-body">
                            <div className="tasks-editor-grid">
                                <label className="tracking-modal-field tasks-editor-field tasks-editor-field-checkbox">
                                    <span>Completed</span>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(draftTask.completed)}
                                        onChange={event => handleCompletedChange(event.target.checked)}
                                    />
                                </label>

                                <label className="tracking-modal-field tasks-editor-field">
                                    <span>Created Date</span>
                                    <input
                                        type="date"
                                        value={draftTask.created_at ?? ""}
                                        onChange={event => handleDraftChange("created_at", event.target.value)}
                                    />
                                </label>

                                <label className="tracking-modal-field tasks-editor-field">
                                    <span>Task Number</span>
                                    <input
                                        type="text"
                                        value={draftTask.task_number ?? ""}
                                        onChange={event => handleDraftChange("task_number", event.target.value)}
                                    />
                                </label>

                                <label className="tracking-modal-field tasks-editor-field">
                                    <span>Organization</span>
                                    <select
                                        value={String(draftTask.organizationId ?? "")}
                                        onChange={event => handleDraftOrganizationChange(event.target.value)}
                                    >
                                        <option value="">Select organization</option>
                                        {organizations.map(organization => (
                                            <option key={organization.id} value={String(organization.id)}>
                                                {organization.shortName}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="tracking-modal-field tasks-editor-field">
                                    <span>Client</span>
                                    <select
                                        value={String(draftTask.clientId ?? "")}
                                        onChange={event => handleDraftClientChange(event.target.value)}
                                        disabled={editorClients.length === 0}
                                    >
                                        <option value="">Select client</option>
                                        {editorClients.map(client => (
                                            <option key={client.id} value={String(client.id)}>
                                                {client.shortName}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="tracking-modal-field tasks-editor-field">
                                    <span>Project</span>
                                    <select
                                        value={String(draftTask.projectId ?? "")}
                                        onChange={event => handleDraftProjectChange(event.target.value)}
                                        disabled={editorProjects.length === 0}
                                    >
                                        <option value="">Select project</option>
                                        {editorProjects.map(project => (
                                            <option key={project.id} value={String(project.id)}>
                                                {project.shortName}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="tracking-modal-field tasks-editor-field">
                                    <span>Software Product</span>
                                    <select
                                        value={String(draftTask.softwareProductId ?? "")}
                                        onChange={event => handleDraftSoftwareProductChange(event.target.value)}
                                        disabled={softwareProducts.length === 0}
                                    >
                                        <option value="">
                                            {softwareProducts.length === 0 ? "No software products" : "Select software product"}
                                        </option>
                                        {softwareProducts.map(product => (
                                            <option key={product.id} value={String(product.id)}>
                                                {product.shortName} - {product.fullName}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="tracking-modal-field tasks-editor-field tasks-editor-field-full">
                                    <span>Name</span>
                                    <input
                                        type="text"
                                        value={draftTask.name ?? ""}
                                        onChange={event => handleDraftChange("name", event.target.value)}
                                    />
                                </label>

                                <label className="tracking-modal-field tasks-editor-field tasks-editor-field-full">
                                    <span>Description</span>
                                    <textarea
                                        rows="3"
                                        value={draftTask.description ?? ""}
                                        onChange={event => handleDraftChange("description", event.target.value)}
                                    />
                                </label>

                                <label className="tracking-modal-field tasks-editor-field tasks-editor-field-full">
                                    <span>Implementation Details</span>
                                    <textarea
                                        rows="4"
                                        value={draftTask.implementation_details ?? ""}
                                        onChange={event => handleDraftChange("implementation_details", event.target.value)}
                                    />
                                </label>

                                <label className="tracking-modal-field tasks-editor-field">
                                    <span>Estimated Hours</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.25"
                                        value={draftTask.estimated_hours}
                                        onChange={event => handleEstimatedHoursChange(event.target.value)}
                                    />
                                </label>
                            </div>
                            {softwareProducts.length === 0 ? (
                                <div className="tracking-modal-error">
                                    No software products are available. Add software products in Settings.
                                </div>
                            ) : null}
                        </div>
                        <div className="tracking-modal-actions">
                            <button type="button" className="tracking-modal-button" onClick={handleSaveTask}>
                                Save
                            </button>
                            <button
                                type="button"
                                className="tracking-modal-button tracking-modal-button-secondary"
                                onClick={handleCancelTask}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {validationDialogOpen && (
                <div className="tracking-modal-overlay" role="presentation">
                    <div
                        className="tracking-modal tracking-modal-confirm"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="tasks-validation-title"
                    >
                        <div className="tracking-modal-header">
                            <h3 id="tasks-validation-title">Validation errors</h3>
                        </div>
                        <div className="tracking-modal-body">
                            <ul className="tracking-modal-list">
                                {validationIssues.map((issue, index) => (
                                    <li key={`${issue}-${index}`}>{issue}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="tracking-modal-actions">
                            <button type="button" className="tracking-modal-button" onClick={() => setValidationDialogOpen(false)}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {warningDialogOpen && (
                <div className="tracking-modal-overlay" role="presentation">
                    <div
                        className="tracking-modal tracking-modal-confirm"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="tasks-warning-title"
                    >
                        <div className="tracking-modal-header">
                            <h3 id="tasks-warning-title">Delete not available</h3>
                        </div>
                        <div className="tracking-modal-body">
                            <p className="tracking-modal-text">{warningMessage}</p>
                        </div>
                        <div className="tracking-modal-actions">
                            <button type="button" className="tracking-modal-button" onClick={() => setWarningDialogOpen(false)}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {switchDialogOpen && (
                <div className="tracking-modal-overlay" role="presentation">
                    <div
                        className="tracking-modal tracking-modal-confirm"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="tasks-switch-title"
                    >
                        <div className="tracking-modal-header">
                            <h3 id="tasks-switch-title">Unsaved changes</h3>
                        </div>
                        <div className="tracking-modal-body">
                            <p className="tracking-modal-text">
                                There are unsaved changes for the current task. What do you want to do?
                            </p>
                        </div>
                        <div className="tracking-modal-actions">
                            <button type="button" className="tracking-modal-button" onClick={handleSaveFromSwitchDialog}>
                                Save changes
                            </button>
                            <button type="button" className="tracking-modal-button" onClick={handleDiscardFromSwitchDialog}>
                                Discard changes
                            </button>
                            <button type="button" className="tracking-modal-button tracking-modal-button-secondary" onClick={handleStayEditing}>
                                Stay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
