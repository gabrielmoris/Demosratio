import express from "express";
import "express-async-errors"; // So I dont need to use next for async callbacks in the routes
import { json } from "body-parser";
import { indexParliamentRouter } from "./routes/index";
import verifyConnections, { writePool, listenPool } from "./db";

const app = express();
app.use(json());
app.set("trust proxy", true); // Trust the proxy from ingress-nginx

app.use(indexParliamentRouter);

app.get("/write", async (req, res) => {
  const result = await writePool.query("SELECT NOW()");
  res.send(`Write pool time: ${result.rows[0].now}`);
});

app.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

export { app };
