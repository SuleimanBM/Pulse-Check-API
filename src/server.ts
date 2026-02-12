import express from "express";
import { router } from "./routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
export const app = express();

app.use(express.json());
app.use(router);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


