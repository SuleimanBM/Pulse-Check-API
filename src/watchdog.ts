import { Monitor } from "./types";
import { setMonitor } from "./monitorStore";

const timers = new Map<string, NodeJS.Timeout>();

export function startTimer(monitor: Monitor) {
    stopTimer(monitor.id);

    if (!monitor.expiresAt) return;

    const delay = monitor.expiresAt - Date.now();
    if (delay <= 0) {
        triggerAlert(monitor);
        return;
    }

    const timer = setTimeout(() => {
        triggerAlert(monitor);
    }, delay);

    timers.set(monitor.id, timer);
}

export function stopTimer(id: string) {
    const timer = timers.get(id);
    if (timer) clearTimeout(timer);
    timers.delete(id);
}

function triggerAlert(monitor: Monitor) {
    if (monitor.status !== "ACTIVE") return;

    monitor.status = "DOWN";
    monitor.expiresAt = null;

    console.log({
        ALERT: `Device ${monitor.id} is down!`,
        time: new Date().toISOString()
    });

    setMonitor(monitor);
    stopTimer(monitor.id);
}

