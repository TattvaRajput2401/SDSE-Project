import { NextFunction, Request, Response } from "express";

export abstract class BaseController {
  protected ok(res: Response, data: unknown, message?: string): Response {
    return res.status(200).json({ success: true, message, data });
  }

  protected created(res: Response, data: unknown, message?: string): Response {
    return res.status(201).json({ success: true, message, data });
  }

  protected fail(res: Response, status: number, message: string): Response {
    return res.status(status).json({ success: false, message });
  }

  protected asyncHandler<TReq extends Request = Request>(
    fn: (req: TReq, res: Response, next: NextFunction) => Promise<Response | void>
  ) {
    return (req: TReq, res: Response, next: NextFunction): void => {
      fn(req, res, next).catch(next);
    };
  }
}
