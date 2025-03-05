import { app } from "./app";
// import verifyConnections from "./database/db";

const start = async () => {
  try {
    // await verifyConnections();
  } catch {
    throw new Error("Error connecting to DB");
  }
  app.listen(3002, () => {
    console.log("Listening proposals on port 3002");
  });
};

start();
