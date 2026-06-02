import api from "../api/api";

function createImportFormData(file) {
    const formData = new FormData();
    formData.append("file", file);
    return formData;
}

export async function validateImportFile(file) {
    const response = await api.post("/administration/import/validate", createImportFormData(file), {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
}

export async function getImportSchema() {
    const response = await api.get("/import/schema");
    return response.data;
}

export async function importValidatedFile(file) {
    const response = await api.post("/administration/import", createImportFormData(file), {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
}

export async function downloadFullDataExport() {
    const response = await api.get("/export/full-data", {
        responseType: "blob"
    });

    return {
        blob: response.data,
        fileName: readAttachmentFileName(response.headers["content-disposition"])
            ?? defaultExportFileName()
    };
}

function readAttachmentFileName(contentDisposition) {
    if (!contentDisposition) {
        return null;
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1].replace(/"/g, ""));
    }

    const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    return asciiMatch?.[1] ?? null;
}

function defaultExportFileName() {
    const now = new Date();
    const pad = value => String(value).padStart(2, "0");
    const timestamp = [
        now.getFullYear(),
        pad(now.getMonth() + 1),
        pad(now.getDate())
    ].join("-") + "_" + [
        pad(now.getHours()),
        pad(now.getMinutes())
    ].join("-");

    return `dev_platform_full_export_${timestamp}.xlsx`;
}
