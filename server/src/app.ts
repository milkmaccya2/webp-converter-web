import { Hono } from "hono";
import { cors } from "hono/cors";
import { convertRoute } from "./routes/convert.js";

const app = new Hono();

app.use("/api/*", cors());

app.route("/api", convertRoute);

export { app };
