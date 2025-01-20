import express from "express";
import dotenv from "dotenv";
import { routes } from "./routes";
import cors from "cors";
import path from "path";


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api", routes);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
