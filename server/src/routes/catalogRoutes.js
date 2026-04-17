import { Router } from "express";
import * as catalogController from "../controllers/catalogController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  validateApplianceCategoryPayload,
  validateRoomTypePayload,
} from "../validators/catalogValidator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(catalogController.list));

router.post(
  "/room-types",
  authorize("admin"),
  validate(validateRoomTypePayload),
  asyncHandler(catalogController.createRoomType),
);
router.patch(
  "/room-types/:id",
  authorize("admin"),
  validate(validateRoomTypePayload),
  asyncHandler(catalogController.updateRoomType),
);
router.delete("/room-types/:id", authorize("admin"), asyncHandler(catalogController.deleteRoomType));

router.post(
  "/appliance-categories",
  authorize("admin"),
  validate(validateApplianceCategoryPayload),
  asyncHandler(catalogController.createApplianceCategory),
);
router.patch(
  "/appliance-categories/:id",
  authorize("admin"),
  validate(validateApplianceCategoryPayload),
  asyncHandler(catalogController.updateApplianceCategory),
);
router.delete(
  "/appliance-categories/:id",
  authorize("admin"),
  asyncHandler(catalogController.deleteApplianceCategory),
);

export default router;
