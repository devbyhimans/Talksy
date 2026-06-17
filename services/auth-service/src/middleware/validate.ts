import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const validate = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
                });
            }
            next(error);
        }
    };
};
