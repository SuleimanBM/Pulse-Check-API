export type MonitorStatus = "ACTIVE" | "PAUSED" | "DOWN";

export interface Monitor {
    id: string;
    timeout: number;
    status: MonitorStatus;
    expiresAt: number | null;
    alertEmail: string;
}
