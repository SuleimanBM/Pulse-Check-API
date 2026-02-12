import express from "express";
import { getMonitor, setMonitor } from "./monitorStore";
import { startTimer, stopTimer } from "./watchdog";
import { Monitor } from "./types";

export const router = express.Router();


router.post("/monitors", (req, res) => {
    const { id, timeout, alert_email } = req.body;

    if (!id || !timeout || !alert_email) {
        return res.status(400).json({ error: "Invalid input" });
    }

    if (getMonitor(id)) {
        return res.status(409).json({ error: "Monitor already exists" });
    }

    const monitor: Monitor = {
        id,
        timeout,
        status: "ACTIVE",
        alertEmail: alert_email,
        expiresAt: Date.now() + timeout * 1000
    };

    setMonitor(monitor);
    startTimer(monitor);

    res.status(201).json({ message: "Monitor registered" });
});


router.post("/monitors/:id/heartbeat", (req, res) => {
    const monitor = getMonitor(req.params.id);
    if (!monitor) return res.sendStatus(404);

    monitor.status = "ACTIVE";
    monitor.expiresAt = Date.now() + monitor.timeout * 1000;

    setMonitor(monitor);
    startTimer(monitor);

    res.json({ message: "Heartbeat received" });
});


router.post("/monitors/:id/pause", (req, res) => {
    const monitor = getMonitor(req.params.id);
    if (!monitor) return res.sendStatus(404);

    monitor.status = "PAUSED";
    monitor.expiresAt = null;

    stopTimer(monitor.id);
    setMonitor(monitor);

    res.json({ message: "Monitor paused" });
});
