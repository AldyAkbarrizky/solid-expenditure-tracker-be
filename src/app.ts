import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import transactionRoutes from "./routes/transaction.routes";
import categoryRoutes from "./routes/category.routes";

const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(hpp());
  app.use(cookieParser());
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  const corsOptions = {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      // A. Allow requests tanpa origin (misal mobile, curl request, dan juga postman)
      if (!origin) return callback(null, true);

      // Jaga jaga siapa tau nanti ngebuat FE untuk admin lokal
      const allowedOrigins = [
        "http://localhost:3000",
        "https://your-production-frontend.vercel.app",
      ];

      const isLocalDev =
        origin.startsWith("http://192.168.") ||
        origin.startsWith("http://10.0.");
      const isAllowedOrigin = allowedOrigins.includes(origin);

      if (isLocalDev || isAllowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  };

  app.use(cors(corsOptions));

  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      status: "success",
      message: "Expense Tracker API is running",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/categories", categoryRoutes);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    if (err.name === "ZodError") {
      return res.status(400).json({
        status: "fail",
        message: "Validation Error",
        errors: err.errors,
      });
    }

    res.status(err.status || 500).json({
      status: "error",
      message: err.message || "Internal Server Error",
    });
  });

  return app;
};

export default createApp;
