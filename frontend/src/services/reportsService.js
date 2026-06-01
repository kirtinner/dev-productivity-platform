import api from "../api/api";

function mapReportTask(task) {
    return {
        taskId: task.taskId,
        taskName: task.taskName ?? "",
        hours: Number(task.hours ?? 0)
    };
}

function mapReportClient(client) {
    return {
        clientId: client.clientId,
        clientName: client.clientName ?? "",
        totalHours: Number(client.totalHours ?? 0),
        tasks: (client.tasks ?? []).map(mapReportTask)
    };
}

export async function getWorkEffortReport(from, to) {
    const response = await api.get("/reports/work-effort", {
        params: { from, to }
    });
    const clients = (response.data.clients ?? []).map(mapReportClient);
    const fallbackGrandTotalHours = clients.reduce(
        (sum, client) => sum + Number(client.totalHours ?? 0),
        0
    );

    return {
        from: response.data.from,
        to: response.data.to,
        grandTotalHours: response.data.grandTotalHours == null
            ? fallbackGrandTotalHours
            : Number(response.data.grandTotalHours),
        clients
    };
}
