import express from "express";
import { json } from "body-parser";
import "express-async-errors";
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";
import { signoutRouter } from "./routes/signout";
import cookieSession from "cookie-session";
import cors from "cors";
import { deleteUserRouter } from "./routes/delete-user";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cors({
    origin: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "ADD_URL_PROD",
    credentials: true,
  })
);
app.use(cookieSession({ signed: false, secure: process.env.NODE_ENV !== "development" }));

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);
app.use(deleteUserRouter);

app.all("*", (req, res) => {
  res.status(404).send({ error: "Not Found" });
});

export { app };
