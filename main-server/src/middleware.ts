import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "./config";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): any => {
    const token: any = req.headers.authorization;

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        //@ts-ignore
        req.id = payload.id;
        next();
    } catch (error) {
        return res.status(403).json({
            message: "You are not logged in.",
        });
    }
};
