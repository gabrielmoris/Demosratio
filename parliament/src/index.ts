import { app } from "./app";
import verifyConnections from "./db";

const start = async () => {
  try {
    await verifyConnections();
  } catch {
    throw new Error("Error connecting to DB"); // Use https://tslog.js.org/#/?id=minlevel
  }
  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();
