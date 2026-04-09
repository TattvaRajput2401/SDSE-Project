import { Router } from "express";
import { profileController } from "../controllers/profileController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware";
import { profileCreationSchema, profileUpdateSchema } from "../validators/profileValidators";

const router = Router();

router.use(authMiddleware);
router.post("/create", validate(profileCreationSchema), profileController.createProfile);
router.get("/", profileController.getProfile);
router.get("/:userId", profileController.getProfile);
router.patch("/", validate(profileUpdateSchema), profileController.updateProfile);
router.patch("/:userId", validate(profileUpdateSchema), profileController.updateProfile);
router.delete("/", profileController.deleteProfile);
router.delete("/:userId", profileController.deleteProfile);

export default router;
