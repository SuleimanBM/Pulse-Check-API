import swaggerJsdoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";

const options: Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Pulse-Check API (Watchdog Sentinel)",
            version: "1.0.0",
            description:
                "Dead Man's Switch API for monitoring remote devices via resettable watchdog timers."
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ],
        components: {
            schemas: {
                Monitor: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "device-123" },
                        timeout: { type: "integer", example: 60 },
                        status: {
                            type: "string",
                            enum: ["ACTIVE", "PAUSED", "DOWN"],
                            example: "ACTIVE"
                        },
                        expiresAt: {
                            type: "integer",
                            example: 1700000000000,
                            nullable: true
                        },
                        alertEmail: {
                            type: "string",
                            example: "admin@critmon.com"
                        }
                    }
                },
                RegisterMonitorRequest: {
                    type: "object",
                    required: ["id", "timeout", "alert_email"],
                    properties: {
                        id: { type: "string", example: "device-123" },
                        timeout: { type: "integer", example: 60 },
                        alert_email: {
                            type: "string",
                            example: "admin@critmon.com"
                        }
                    }
                }
            }
        }
    },
    apis: ["./src/routes.ts"]
};

export const swaggerSpec = swaggerJsdoc(options);
