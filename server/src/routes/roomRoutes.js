import { Router } from "express";
import * as roomController from "../controllers/roomController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { validateRoomPayload } from "../validators/roomValidator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(roomController.list));
router.get("/:id", asyncHandler(roomController.show));
router.post("/", authorize("admin", "resident"), validate(validateRoomPayload), asyncHandler(roomController.create));
router.patch("/:id", authorize("admin", "resident"), asyncHandler(roomController.update));
router.delete("/:id", authorize("admin", "resident"), asyncHandler(roomController.destroy));

export default router;

