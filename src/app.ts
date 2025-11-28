import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import transactionRoutes from "./routes/transaction.routes";
import categoryRoutes from "./routes/category.routes";
import statsRoutes from "./routes/stats.routes";
import familyRoutes from "./routes/family.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { config } from "./config";

const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(hpp());
  app.use(cookieParser());
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  const corsOptions = {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {

      if (!origin) return callback(null, true);

      if (config.env === "development") {
        return callback(null, true);
      }
      
      const allowedOrigins = config.cors.allowedOrigins;
      if (allowedOrigins.includes(origin)) {
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
  app.use("/api/stats", statsRoutes);
  app.use("/api/families", familyRoutes);

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

const app = createApp();

export { createApp };
export default app;
