import { Router } from "express";
import { doshaController } from "../controllers/doshaController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware";
import { doshaCheckSchema } from "../validators/doshaValidators";

const router = Router();

router.get("/types", doshaController.getDoshaTypes);
router.use(authMiddleware);
router.get("/search", doshaController.searchDoshas);
router.post("/check", validate(doshaCheckSchema), doshaController.checkDosha);
router.get("/:doshaId/report", doshaController.getDoshaReport);
router.delete("/:doshaId", doshaController.deleteDoshaReport);

export default router;
