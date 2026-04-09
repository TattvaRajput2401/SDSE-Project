import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";

export const validate = (schema: ObjectSchema, source: "body" | "query" = "body") => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const payload = req[source];
    const { error, value } = schema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
    }

    (req as Request)[source] = value;
    return next();
  };
};
