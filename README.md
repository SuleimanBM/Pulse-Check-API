# Pulse-Check API (Watchdog Sentinel)

This is a lightweight backend service built with Node.js, Express, and TypeScript that monitors remote devices using a watchdog timer mechanism.

The system tracks registered monitors and triggers alerts if a device fails to send a heartbeat within its configured timeout period. It also supports pausing and resuming monitoring without generating false alerts.

## Problem Statement

In remote environments (e.g., solar farms, weather stations, IoT deployments), devices must periodically confirm that they are operational. If they stop responding, the system must detect this and raise an alert.

This project implements a **Watchdog Timer API** that:

i. Registers monitors

ii. Accepts periodic heartbeats

iii. Triggers alerts when heartbeats stop

iv. Supports pause/resume functionality

v. Persists monitor state for crash recovery

## Architecture Overview

The system consists of five main components:

Client Devices – Send registration and heartbeat requests.

Express API Server – Handles HTTP routes and orchestrates logic.

Watchdog Timer Engine – Manages in-memory timers.

Persistence Layer – Stores monitor state in monitors.json.

Alert System – Logs alert events when timeouts occur.

## System Flows
### 1. Monitor Registration Flow

When a new monitor is registered:

i. The API creates a monitor record.

ii. The system calculates expiresAt = now + timeout.

iii. The monitor is saved to persistence.

iv. A one-shot watchdog timer is started.

v. Status is set to ACTIVE.

Flow Summary
Client → POST /monitors
        → Express Server
        → Save to Persistence
        → Start Watchdog Timer
        → Status = ACTIVE

### 2. Heartbeat Flow (Timer Reset)

When a heartbeat is received:

i. The monitor is validated.

ii. expiresAt is recalculated.

iii. The previous timer is cleared.

iv. A new watchdog timer is started.

v. State is saved to persistence.


Flow Summary  
Client → POST /monitors/:id/heartbeat  
        → Update expiresAt  
        → Save to Persistence  
        → Reset Watchdog Timer

### 3. Pause / Resume / Alert Flow

When a monitor is paused:

i. Status is set to PAUSED.

ii. The watchdog timer is stopped.

iii. No alerts are triggered.

iv. When a heartbeat is received after pause:

v. Status returns to ACTIVE.

vi. Timer is restarted.

vii. Monitoring resumes normally.

![Alt text](./flowchart.jpg)
### If a monitor remains ACTIVE and the timeout expires:

triggerAlert() is executed.

An alert message is logged.

Status becomes DOWN.

Flow Summary  
Pause → Stop Timer → Status = PAUSED

Heartbeat → Status = ACTIVE → Start Timer

Timeout Expiry → triggerAlert() → Status = DOWN

## Persistence & Crash Recovery

Monitor state is stored in monitors.json, including:

id  
timeout  
status  
expiresAt  
alert_email

On server startup:

The system loads all monitors.  
For each monitor with status ACTIVE:  
If expiresAt is in the future → restart timer.  
If expiresAt has passed → trigger alert immediately.

This ensures monitoring continues correctly even after a crash or restart.

## Tech Stack

Node.js  
Express  
TypeScript  
File-based persistence (JSON)  
In-memory watchdog timers

## How to Run the Project
1. Clone the repository
git clone <your-repo-url>
cd pulse-check-api

1. Install dependencies
npm install

1. Build the project
npm run build

1. Start the server
npm start


Server runs on
http://localhost:3000

## API Endpoints
The swagger api is accessed on http://localhost:3000/docs

### Register Monitor
POST /monitors


Body:  
{
  "id": "monitor-1",
  "timeout": 60,
  "alert_email": "alert@example.com"
}

### Send Heartbeat
POST /monitors/:id/heartbeat  
eg: http://localhost:3000/monitors/monitor-1/heartbeat

### Pause Monitor
POST /monitors/:id/pause  
eg: http://localhost:3000/monitors/monitor-1/pause

## Design Decisions
1. One-Shot Timers

Each monitor uses a one-shot timer (setTimeout) rather than an interval.
This allows precise reset control and avoids drift.

2. File-Based Persistence

A JSON file was chosen for simplicity and portability.
This avoids external database dependencies while still supporting crash recovery.

3. Status Guard Before Alert

Before triggering an alert, the system verifies:

if (monitor.status !== "ACTIVE") return;


This prevents false alerts when a monitor is paused.

4. Separation of Concerns

Routing logic is separated from timer logic.

Persistence is abstracted from request handling.

Alert triggering is isolated from monitor updates.

## Developer’s Choice Challenge
Added Feature: Persistent State & Crash Recovery

The base watchdog system works while the server is running.  
However, without persistence:

If the server crashes
or the process is restarted,
all monitor data would be lost.
Timers would disappear.
Monitoring state would reset.
And alerts could be missed.

That makes the system unreliable in real-world conditions.

### What I Added

I implemented file-based persistence with crash recovery.
The system now:  
Stores all monitor data in monitors.json.
It saves state on every update (registration, heartbeat, pause)
and reconstructs timers automatically on server startup.  
This ensures the system resumes from where it left off.

## Conclusion

This project demonstrates a reliable watchdog monitoring system using TypeScript and Express. It emphasizes clean architecture, state persistence, timer management, and fault tolerance.

The implementation ensures:

Accurate monitoring

Crash recovery

False-alert prevention

Clear separation of responsibilities