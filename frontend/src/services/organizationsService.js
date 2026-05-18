import api from "../api/api";

export async function getOrganizations() {
    const response = await api.get("/organizations");
    return response.data;
}

export async function getOrganizationById(id) {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
}

export async function createOrganization(payload) {
    const response = await api.post("/organizations", payload);
    return response.data;
}

export async function updateOrganization(id, payload) {
    const response = await api.put(`/organizations/${id}`, payload);
    return response.data;
}

export async function deleteOrganization(id) {
    await api.delete(`/organizations/${id}`);
}
