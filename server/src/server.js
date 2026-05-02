import "./config/env.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";


const app = express();

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);                 // ← SECOND

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});