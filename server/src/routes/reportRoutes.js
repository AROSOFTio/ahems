import { Router } from "express";
import * as reportController from "../controllers/reportController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { validateReportGeneration } from "../validators/reportValidator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(reportController.list));
router.get("/exports", asyncHandler(reportController.exportsList));
router.post("/generate", validate(validateReportGeneration), asyncHandler(reportController.generate));

export default router;

