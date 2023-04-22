import express from "express";
import dotenv from "dotenv";
import { initializeNodeConnection } from "./utils";
import ageRouter from "./routes/age";
import nftRouter from "./routes/nft";

dotenv.config();

const app = express();
const { PORT, API_KEY } = process.env;

if (!PORT || !API_KEY) {
  throw new Error("Enviroment variables are not set correctly");
}

initializeNodeConnection(API_KEY);

app.use("/age", ageRouter);
app.use("/nft", nftRouter);
app.listen(PORT, () => console.log(`Listening to ${PORT}`));
