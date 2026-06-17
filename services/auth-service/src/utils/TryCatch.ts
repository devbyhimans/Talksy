import type { Request, Response, NextFunction } from "express";

const TryCatch = (func: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        return Promise.resolve(func(req, res, next)).catch(next);
    };
};

export default TryCatch;
