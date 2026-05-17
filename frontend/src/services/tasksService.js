import { initialTasks } from "../mock/taskRecords";

function cloneTasks(items) {
    return items.map(item => ({ ...item }));
}

export async function getTasks() {
    return cloneTasks(initialTasks);
}
