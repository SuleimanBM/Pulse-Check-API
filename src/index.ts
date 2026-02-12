import { app } from "./server";
import { loadMonitors } from "./monitorStore";
import { recoverTimers } from "./watchdog";
const PORT = 3000;

loadMonitors();
recoverTimers();

app.listen(PORT, () => {
    console.log(`Pulse-Check API running on port ${PORT}`);
});
