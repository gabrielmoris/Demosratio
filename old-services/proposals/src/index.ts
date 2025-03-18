import { app } from "./app";
import verifyConnections from "./database/db";

const start = async () => {
  try {
    await verifyConnections();
  } catch {
    throw new Error("Error connecting to DB"); // Use https://tslog.js.org/#/?id=minlevel
  }
  app.listen(3001, () => {
    console.log("Listening proposals on port 3001");
  });
};

start();
