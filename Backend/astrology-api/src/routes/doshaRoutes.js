const express = require("express");

const doshaController = require("../controllers/doshaController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const { doshaCheckSchema } = require("../validators/doshaValidators");

const router = express.Router();

router.get("/types", doshaController.getDoshaTypes);

router.use(authMiddleware);

router.get("/search", doshaController.searchDoshas);
router.post("/check", validate(doshaCheckSchema), doshaController.checkDosha);
router.get("/:doshaId/report", doshaController.getDoshaReport);
router.delete("/:doshaId", doshaController.deleteDoshaReport);

module.exports = router;
