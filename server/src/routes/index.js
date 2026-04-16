import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import roomRoutes from "./roomRoutes.js";
import applianceRoutes from "./applianceRoutes.js";
import simulationRoutes from "./simulationRoutes.js";
import automationRoutes from "./automationRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import reportRoutes from "./reportRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import adminRoutes from "./adminRoutes.js";
import { pingDatabase } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const database = await pingDatabase();
    res.json({
      success: true,
      message: "AHEMS API is healthy.",
      data: {
        api: "ok",
        database,
        timestamp: new Date().toISOString(),
      },
    });
  }),
);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/rooms", roomRoutes);
router.use("/appliances", applianceRoutes);
router.use("/simulations", simulationRoutes);
router.use("/automation-rules", automationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reports", reportRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/settings", settingsRoutes);
router.use("/admin", adminRoutes);

export default router;

