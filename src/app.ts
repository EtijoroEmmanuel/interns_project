import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import ErrorResponse from "./utils/errorResponse";
import errorHandler from "./middlewares/errorHandler";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth";

dotenv.config();
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: `Welcome!` });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  return next(
    new ErrorResponse(`Can't find ${req.originalUrl} on this server`, 404)
  );
});

app.use(errorHandler);

export default app;
