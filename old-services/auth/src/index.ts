import { app } from "./app";

const start = async () => {
  app.listen(3002, () => {
    console.log("Listening proposals on port 3002");
  });
};

start();
