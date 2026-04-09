import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { BaseController } from "../core/BaseController";
import { UserModel } from "../models/UserModel";

class AuthController extends BaseController {
  private signToken(user: { _id: unknown; email: string; role: "user" | "admin" }): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");

    return jwt.sign(
      { _id: String(user._id), email: user.email, role: user.role },
      secret,
      { expiresIn: "7d" }
    );
  }

  public signup = this.asyncHandler(async (req: Request, res: Response) => {
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

  public signin = this.asyncHandler(async (req: Request, res: Response) => {
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
}

export const authController = new AuthController();
