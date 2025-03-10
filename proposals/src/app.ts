import express from "express";
import "express-async-errors"; // So I dont need to use next for async callbacks in the routes
import { json } from "body-parser";
import cors from "cors";
import { getProposalsRouter } from "./routes/proposals";
import { getLikesAndDislikesRouter } from "./routes/likes";

const app = express();

app.set("trust proxy", true);
app.use(json());
app.use(
  cors({
    origin: process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(getProposalsRouter);
app.use(getLikesAndDislikesRouter);

app.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

export { app };
