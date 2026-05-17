import { initialSoftwareProducts } from "../mock/softwareProducts";

function cloneSoftwareProducts(items) {
    return items.map(item => ({ ...item }));
}

export async function getSoftwareProducts() {
    return cloneSoftwareProducts(initialSoftwareProducts);
}
