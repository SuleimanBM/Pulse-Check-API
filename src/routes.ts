import express from "express";
import { getMonitor, setMonitor } from "./monitorStore";
import { startTimer, stopTimer } from "./watchdog";
import { Monitor } from "./types";

export const router = express.Router();

/**
 * @openapi
 * /monitors:
 *   post:
 *     summary: Register a new monitor
 *     tags:
 *       - Monitors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterMonitorRequest'
 *     responses:
 *       201:
 *         description: Monitor registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Monitor already exists
 */
/*This route is to be used to register devices */
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

/**
 * @openapi
 * /monitors/{id}/heartbeat:
 *   post:
 *     summary: Send heartbeat and reset timer
 *     tags:
 *       - Monitors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Monitor ID
 *     responses:
 *       200:
 *         description: Heartbeat received
 *       404:
 *         description: Monitor not found
 */
/*This route is to be used to recieve heartbeat */
router.post("/monitors/:id/heartbeat", (req, res) => {
    const monitor = getMonitor(req.params.id);
    if (!monitor) return res.sendStatus(404);

    monitor.status = "ACTIVE";
    monitor.expiresAt = Date.now() + monitor.timeout * 1000;

    setMonitor(monitor);
    startTimer(monitor);

    res.json({ message: "Heartbeat received" });
});

/**
 * @openapi
 * /monitors/{id}/pause:
 *   post:
 *     summary: Pause monitoring
 *     tags:
 *       - Monitors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Monitor ID
 *     responses:
 *       200:
 *         description: Monitor paused
 *       404:
 *         description: Monitor not found
 */
/*This route is to be used to recieve the pause signal from devices */
router.post("/monitors/:id/pause", (req, res) => {
    const monitor = getMonitor(req.params.id);
    if (!monitor) return res.sendStatus(404);

    monitor.status = "PAUSED";
    monitor.expiresAt = null;

    stopTimer(monitor.id);
    setMonitor(monitor);

    res.json({ message: "Monitor paused" });
});
