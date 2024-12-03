import { Router } from "express";
import { authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import { dbClient } from "../db";

const router = Router();

router.post("/", authMiddleware, async (req: any, res: any) => {
    const body = req.body;
    const parsedBody = ZapCreateSchema.safeParse(body);
    const userId = req.id;

    if (!parsedBody.success) {
        return res.status(411).json({
            message: "Incorrect inputs.",
        });
    }

    const newZapId = await dbClient.$transaction(async (tx) => {
        const zap = await tx.zap.create({
            data: {
                triggerId: "",
                userId: parseInt(userId),
                actions: {
                    create: parsedBody.data.actions.map((x, index) => ({
                        actionId: x.availableActionId,
                        sortingOrder: index,
                        metadata: x.actionMetadata,
                    })),
                },
            },
        });

        const trigger = await tx.trigger.create({
            data: {
                triggerId: parsedBody.data.availableTriggerId,
                zapId: zap.id,
            },
        });

        await tx.zap.update({
            where: {
                id: zap.id,
            },
            data: {
                triggerId: trigger.id,
            },
        });

        return zap.id;
    });

    res.json({
        message: "New Zap Created!",
        zapId: newZapId,
    });
});

router.get("/", authMiddleware, async (req, res) => {
    // @ts-ignore
    const id = req.id;
    const zaps = await dbClient.zap.findMany({
        where: {
            userId: id,
        },
        include: {
            actions: {
                include: {
                    type: true,
                },
            },
            trigger: {
                include: {
                    type: true,
                },
            },
        },
    });

    res.json({
        zaps,
    });
});

router.get("/:zapId", authMiddleware, async (req, res) => {
    // @ts-ignore
    const id = req.id;
    const zapId = req.params.zapId;

    const zap = await dbClient.zap.findFirst({
        where: {
            userId: id,
            id: zapId,
        },
        include: {
            actions: {
                include: {
                    type: true,
                },
            },
            trigger: {
                include: {
                    type: true,
                },
            },
        },
    });

    res.json({
        zap,
    });
});

export const zapRouter = router;
