import { Router } from "express";
import { userController } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

router.use(authMiddleware);
router.get("/me", userController.getMe);
router.get("/", roleMiddleware("admin"), userController.getUsers);

export default router;
