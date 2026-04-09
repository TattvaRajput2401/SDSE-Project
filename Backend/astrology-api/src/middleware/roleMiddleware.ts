import { NextFunction, Request, Response } from "express";

export const roleMiddleware =
  (...allowedRoles: Array<"user" | "admin">) =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user?.role) {
      return res.status(403).json({ success: false, message: "Role not found" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Insufficient access" });
    }

    return next();
  };
