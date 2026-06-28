import api from "../api/api";

function mapTimeEntry(entry) {
    return {
        id: entry.id,
        date: entry.date,
        organizationId: entry.organizationId ?? entry.organization?.id ?? null,
        organizationName: entry.organizationName ?? entry.organization?.shortName ?? entry.organization?.fullName ?? "",
        clientId: entry.clientId,
        clientName: entry.clientName ?? entry.client?.shortName ?? entry.client?.fullName ?? "",
        projectId: entry.projectId ?? entry.task?.projectId ?? entry.task?.project?.id ?? null,
        projectName: entry.projectName ?? entry.task?.projectName ?? entry.task?.project?.shortName ?? "",
        taskId: entry.taskId,
        taskName: entry.taskName ?? entry.task?.name ?? "",
        hours: entry.hours,
        totalTaskHours: entry.totalTaskHours ?? 0,
        comment: entry.comment ?? "",
        developerId: entry.developerId
    };
}

function mapTask(task) {
    return {
        id: task.id,
        name: task.name ?? task.shortName ?? task.fullName ?? "",
        shortName: task.shortName ?? "",
        fullName: task.fullName ?? task.name ?? "",
        clientId: task.clientId ?? task.client?.id ?? null,
        clientName: task.clientName ?? task.client?.shortName ?? task.client?.fullName ?? "",
        organizationId: task.organizationId ?? null,
        projectId: task.projectId ?? null,
        softwareProductId: task.softwareProductId ?? null,
        completed: Boolean(task.completed)
    };
}

function mapClient(client) {
    return {
        id: client.id,
        organizationId: client.organizationId ?? client.organization?.id ?? null,
        name: client.shortName ?? client.name ?? client.fullName ?? "",
        shortName: client.shortName ?? "",
        fullName: client.fullName ?? client.name ?? "",
        notDisplayed: Boolean(client.notDisplayed)
    };
}

function mapProject(project) {
    return {
        id: project.id,
        organizationId: project.organizationId ?? project.organization?.id ?? null,
        clientId: project.clientId ?? project.client?.id ?? null,
        shortName: project.shortName ?? "",
        fullName: project.fullName ?? "",
        description: project.description ?? "",
        completed: Boolean(project.completed)
    };
}

let tasksRequestPromise = null;

async function loadTasksResponse() {
    if (!tasksRequestPromise) {
        tasksRequestPromise = api.get("/tasks/active").finally(() => {
            tasksRequestPromise = null;
        });
    }

    return tasksRequestPromise;
}

function compactTaskParams(params = {}) {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value != null && value !== "")
    );
}

export async function getTimeEntriesByDate(date) {
    const response = await api.get("/time-entries", {
        params: { date }
    });

    return response.data.map(mapTimeEntry);
}

export async function getTimeEntriesByMonth(year, month) {
    const response = await api.get("/time-entries/month", {
        params: { year, month: month + 1 }
    });

    return response.data.map(mapTimeEntry);
}

export async function getTimeEntriesByTask(taskId) {
    const response = await api.get(`/tasks/${taskId}/time-entries`);
    return response.data.map(mapTimeEntry);
}

function toTimeEntryRequest(entry) {
    return {
        date: entry.date,
        organizationId: entry.organizationId,
        clientId: entry.clientId,
        taskId: entry.taskId,
        hours: entry.hours,
        comment: entry.comment ?? ""
    };
}

export async function createTimeEntry(entry) {
    const payload = toTimeEntryRequest(entry);
    const response = await api.post("/time-entries", payload);
    return mapTimeEntry(response.data);
}

export async function updateTimeEntry(id, entry) {
    const payload = toTimeEntryRequest(entry);
    const response = await api.put(`/time-entries/${id}`, payload);
    return mapTimeEntry(response.data);
}

export async function deleteTimeEntry(id) {
    await api.delete(`/time-entries/${id}`);
}

export async function getClients() {
    const response = await api.get("/clients");
    return response.data.map(mapClient);
}

export async function getVisibleClients() {
    const response = await api.get("/clients/visible");
    return response.data.map(mapClient);
}

export async function getProjects() {
    const response = await api.get("/projects");
    return response.data.map(mapProject);
}

export async function getTasks() {
    const response = await loadTasksResponse();
    return response.data.map(mapTask);
}

export async function getActiveTasks(params = {}) {
    const response = await api.get("/tasks/active", {
        params: compactTaskParams(params)
    });
    return response.data.map(mapTask);
}
