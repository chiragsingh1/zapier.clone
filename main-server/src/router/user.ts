import { Router } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config";
import { authMiddleware } from "../middleware";
import { SigninSchema, SignupSchema } from "../types";
import { dbClient } from "../db";

const router = Router();

router.post("/signup", async (req: any, res: any) => {
    const body = req.body;
    const parsedData = SignupSchema.safeParse(body);

    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs.",
        });
    }

    const userExists = await dbClient.user.findFirst({
        where: {
            email: req.body.email,
        },
    });

    if (userExists) {
        return res.status(403).json({
            message: "User already exists.",
        });
    }
    await dbClient.user.create({
        data: {
            email: parsedData.data.email,
            // TODO: Hash the password
            password: parsedData.data.password,
            name: parsedData.data.name,
        },
    });

    res.json({
        message:
            "Please verify your email. We have sent you a mail, please check :)",
    });
});

router.post("/signin", async (req: any, res: any) => {
    const body = req.body;

    const parsedData = SigninSchema.safeParse(body);

    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs.",
        });
    }

    const user = await dbClient.user.findFirst({
        where: {
            email: parsedData.data.email,
            password: parsedData.data.password,
        },
    });

    if (!user) {
        return res.status(403).json({
            message: "Incorrect email or password.",
        });
    }

    // sign the JWT
    const token = jwt.sign(
        {
            id: user.id,
        },
        JWT_SECRET
    );

    return res.json({ token });
});

router.post("/", authMiddleware, async (req: any, res: any) => {
    //TODO: Fix the type
    // @ts-ignore
    const id = req.id;

    const user = await dbClient.user.findFirst({
        where: {
            id: id,
        },
        select: {
            name: true,
            email: true,
        },
    });

    res.json({
        user,
    });
});

export const userRouter = router;
