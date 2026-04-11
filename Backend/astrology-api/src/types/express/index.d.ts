import { AuthPayload } from "../auth";

declare module "express" {
  export interface Request {
    user?: AuthPayload;
  }
}
