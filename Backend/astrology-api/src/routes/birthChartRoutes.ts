import { Router } from "express";
import { birthChartController } from "../controllers/birthChartController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware";
import {
  birthDetailsUpdateSchema,
  chartGenerationSchema,
} from "../validators/birthChartValidators";

const router = Router();

router.use(authMiddleware);
router.post("/generate", validate(chartGenerationSchema), birthChartController.generateChart);
router.get("/user", birthChartController.getUserCharts);
router.get("/user/:userId", birthChartController.getUserCharts);
router.get("/:chartId", birthChartController.getChartById);
router.patch("/:chartId", birthChartController.updateChart);
router.patch(
  "/:chartId/birth-details",
  validate(birthDetailsUpdateSchema),
  birthChartController.updateBirthDetails
);
router.delete("/:chartId", birthChartController.deleteChart);

export default router;
