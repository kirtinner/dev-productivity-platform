import { initialDevelopers } from "../mock/developers";

function cloneDevelopers(items) {
    return items.map(item => ({ ...item }));
}

export async function getDevelopers() {
    return cloneDevelopers(initialDevelopers);
}
