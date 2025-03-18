import express from "express";
import "express-async-errors"; // So I dont need to use next for async callbacks in the routes
import { json } from "body-parser";
import cookieSession from "cookie-session";
import cors from "cors";
import { getProposalsRouter } from "./routes/proposals";
import { getLikesAndDislikesRouter } from "./routes/likes";
import { getProposalByIdRouter } from "./routes/getProposalByID";
import { currentUser } from "./middlewares/current-user";
import { getUserLikesAndDislikes } from "./routes/getuserLike";
import { useLike } from "./routes/userLike";
import { userdisLike } from "./routes/userDislike";
import { getProposalsByExpedientRouter } from "./routes/proposalsByExpedient";

const app = express();

app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" })
);
app.use(currentUser);
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(getProposalsRouter);
app.use(getProposalsByExpedientRouter);
app.use(getProposalByIdRouter);
app.use(getLikesAndDislikesRouter);
app.use(getUserLikesAndDislikes);
app.use(useLike);
app.use(userdisLike);

app.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

export { app };
