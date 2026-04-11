import { Router } from "express";
import { chartController } from "../controllers/chartController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware";
import {
  birthDetailsUpdateSchema,
  chartGenerationSchema,
} from "../validators/birthChartValidators";

const router = Router();

router.use(authMiddleware);
router.post("/generate", validate(chartGenerationSchema), chartController.generateChart);
router.get("/user", chartController.getChart);
router.get("/user/:userId", chartController.getChart);
router.get("/:chartId", chartController.getChartById);
router.patch("/:chartId", chartController.renameChart);
router.delete("/:chartId", chartController.deleteChart);

export default router;
