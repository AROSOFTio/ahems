import { Router } from "express";
import authRoutes from "./authRoutes.js";
import roomRoutes from "./roomRoutes.js";
import applianceRoutes from "./applianceRoutes.js";
import simulationRoutes from "./simulationRoutes.js";
import automationRoutes from "./automationRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
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
router.use("/rooms", roomRoutes);
router.use("/appliances", applianceRoutes);
router.use("/simulations", simulationRoutes);
router.use("/automation-rules", automationRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
