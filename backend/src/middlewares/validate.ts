import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction, RequestHandler } from "express";

export function validateDto(dtoClass: any): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(dtoClass, req.body);
    const errors = await validate(instance, { whitelist: true });

    if (errors.length > 0) {
      res.status(400).json({
        errors: errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
      return;
    }

    // replace body with validated and transformed instance
    req.body = instance;
    next();
  };
}