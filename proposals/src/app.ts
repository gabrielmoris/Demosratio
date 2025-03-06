import express from "express";
import "express-async-errors"; // So I dont need to use next for async callbacks in the routes
import { json } from "body-parser";
import cors from "cors";
import { indexParliamentRouter } from "./routes/index";

const app = express();

app.use(cors());
app.use(
  cors({
    origin: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "ADD_URL_PROD",
    credentials: true,
  })
);

app.use(json());
app.set("trust proxy", true); // Trust the proxy from ingress-nginx

app.use(indexParliamentRouter);

app.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

export { app };
