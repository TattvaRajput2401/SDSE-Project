import { Request, Response } from "express";
import { BaseController } from "../core/BaseController";
import { UserModel } from "../models/UserModel";

class UserController extends BaseController {
  public getMe = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return this.fail(res, 401, "Unauthorized");

    const user = await UserModel.findById(userId).select("-password");
    if (!user) return this.fail(res, 404, "User not found");

    return this.ok(res, user);
  });

  public getUsers = this.asyncHandler(async (_req: Request, res: Response) => {
    const users = await UserModel.find().select("-password").sort({ createdAt: -1 });
    return res.json({ success: true, count: users.length, data: users });
  });
}

export const userController = new UserController();
