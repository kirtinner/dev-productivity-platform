import api from "../api/api";

export async function getSoftwareProducts() {
    const response = await api.get("/software-products");
    return response.data;
}

export async function createSoftwareProduct(payload) {
    const response = await api.post("/software-products", payload);
    return response.data;
}

export async function updateSoftwareProduct(id, payload) {
    const response = await api.put(`/software-products/${id}`, payload);
    return response.data;
}

export async function deleteSoftwareProduct(id) {
    await api.delete(`/software-products/${id}`);
}
