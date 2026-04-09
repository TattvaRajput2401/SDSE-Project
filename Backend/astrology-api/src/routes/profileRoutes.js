const express = require("express");

const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const {
  profileCreationSchema,
  profileUpdateSchema,
} = require("../validators/profileValidators");

const router = express.Router();

router.use(authMiddleware);

router.post("/create", validate(profileCreationSchema), profileController.createProfile);
router.get("/", profileController.getProfile);
router.get("/:userId", profileController.getProfile);
router.patch("/", validate(profileUpdateSchema), profileController.updateProfile);
router.patch("/:userId", validate(profileUpdateSchema), profileController.updateProfile);
router.delete("/", profileController.deleteProfile);
router.delete("/:userId", profileController.deleteProfile);

module.exports = router;
