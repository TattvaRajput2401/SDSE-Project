const express = require("express");

const birthChartController = require("../controllers/birthChartController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const {
  chartGenerationSchema,
  birthDetailsUpdateSchema,
} = require("../validators/birthChartValidators");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/generate",
  validate(chartGenerationSchema),
  birthChartController.generateChart
);
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

module.exports = router;
