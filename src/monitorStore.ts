import fs from "fs";
import path from "path";
import { Monitor } from "./types";

const DATA_FILE = path.join(__dirname, "../data/monitors.json");

let monitors = new Map<string, Monitor>();

export function loadMonitors(): Map<string, Monitor> {
    if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const data: Monitor[] = JSON.parse(raw);
        data.forEach(m => monitors.set(m.id, m));
    }
    return monitors;
}

export function saveMonitors() {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify([...monitors.values()], null, 2)
    );
}

export function getMonitor(id: string) {
    return monitors.get(id);
}

export function setMonitor(monitor: Monitor) {
    monitors.set(monitor.id, monitor);
    saveMonitors();
}

export function getAllMonitors() {
    return [...monitors.values()];
}
