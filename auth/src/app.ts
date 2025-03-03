import express from "express";
import { json } from "body-parser";
import "express-async-errors";
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";
import { signoutRouter } from "./routes/signout";
import cookieSession from "cookie-session";

const app = express();
app.use(json());
app.set("trust proxy", true); // Trust the proxy from ingress-nginx
app.use(cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" }));

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

export { app };
