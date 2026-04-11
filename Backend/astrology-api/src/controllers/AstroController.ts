import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { BaseController } from "../core/BaseController";
import { UserModel } from "../models/UserModel";

class AstroController extends BaseController {
  private signToken(user: { _id: unknown; email: string; role: "user" | "admin" }): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");

    return jwt.sign(
      { _id: String(user._id), email: user.email, role: user.role },
      secret,
      { expiresIn: "7d" }
    );
  }

  public register = this.asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return this.fail(res, 409, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ name, email, password: hashedPassword });
    const token = this.signToken(user);

    return this.created(
      res,
      { token, user: { _id: user._id, name: user.name, email: user.email } },
      "Signup successful"
    );
  });

  public login = this.asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };
    const user = await UserModel.findOne({ email });

    if (!user) return this.fail(res, 401, "Invalid credentials");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return this.fail(res, 401, "Invalid credentials");

    const token = this.signToken(user);
    return this.ok(
      res,
      { token, user: { _id: user._id, name: user.name, email: user.email } },
      "Signin successful"
    );
  });

  public forgotPassword = this.asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body as { email: string };
    const user = await UserModel.findOne({ email });

    if (!user) return this.fail(res, 404, "User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    return this.ok(res, { resetToken }, "Password reset token generated");
  });

  public resetPassword = this.asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params as { token: string };
    const { password } = req.body as { password: string };

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) return this.fail(res, 400, "Invalid or expired reset token");

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return this.ok(res, null, "Password reset successfully");
  });

  public deletedAccount = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return this.fail(res, 401, "Unauthorized");

    await UserModel.findByIdAndDelete(userId);
    return this.ok(res, null, "Account deleted successfully");
  });
}

export const astroController = new AstroController();
