const express = require("express");

const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/me", userController.getMe);
router.get("/", roleMiddleware("admin"), userController.getUsers);

module.exports = router;
