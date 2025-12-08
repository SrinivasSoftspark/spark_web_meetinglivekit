import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import meetingRoutes from "./routes/meetings";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/myapp";

app.use(cors());
app.use(express.json());
app.use("/api/meetings", meetingRoutes);

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
