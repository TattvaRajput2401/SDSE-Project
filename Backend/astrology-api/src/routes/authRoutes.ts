import { Router } from "express";
import { astroController } from "../controllers/AstroController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", astroController.register);
router.post("/signin", astroController.login);
router.post("/forgot-password", astroController.forgotPassword);
router.post("/reset-password/:token", astroController.resetPassword);
router.delete("/delete-account", authMiddleware, astroController.deletedAccount);

export default router;
