import api from "../api/api";

function normalizeClient(client) {
    return {
        ...client,
        organizationId: client.organizationId ?? client.organization?.id ?? null,
        shortName: client.shortName ?? "",
        fullName: client.fullName ?? "",
        notDisplayed: Boolean(client.notDisplayed)
    };
}

export async function getClients() {
    const response = await api.get("/clients");
    return response.data.map(normalizeClient);
}

export async function getVisibleClients() {
    const response = await api.get("/clients/visible");
    return response.data.map(normalizeClient);
}

export async function createClient(payload) {
    const response = await api.post("/clients", payload);
    return normalizeClient(response.data);
}

export async function updateClient(id, payload) {
    const response = await api.put(`/clients/${id}`, payload);
    return normalizeClient(response.data);
}

export async function deleteClient(id) {
    await api.delete(`/clients/${id}`);
}
