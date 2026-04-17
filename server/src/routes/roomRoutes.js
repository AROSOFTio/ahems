import { Router } from "express";
import * as roomController from "../controllers/roomController.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/",      asyncHandler(roomController.list));
router.get("/:id",   asyncHandler(roomController.show));
router.patch("/:id", asyncHandler(roomController.update));

export default router;
