import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import ErrorResponse from "./utils/errorResponse";
import { errorHandler } from "./middlewares/errorHandler";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import rateLimit from "express-rate-limit";
import uploadRoutes from "./routes/upload";
import boatRoutes from "./routes/boat";

dotenv.config();
const app = express();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api", boatRoutes);

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
